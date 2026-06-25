import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email(),
  agencyId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = inviteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Yanlış məlumat formatı' },
        { status: 400 }
      )
    }

    const { email, agencyId } = validationResult.data

    // Verify user is AGENCY_OWNER of this agency
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, agencyId: true },
    })

    if (!dbUser || dbUser.role !== 'AGENCY_OWNER' || dbUser.agencyId !== agencyId) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Send invite email
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        agencyId,
        role: 'AGENT',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    })

    if (error) {
      console.error('Failed to invite user:', error)
      return NextResponse.json(
        { error: 'Dəvət göndərilmədi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to invite agent:', error)
    return NextResponse.json(
      { error: 'Dəvət göndərilmədi' },
      { status: 500 }
    )
  }
}
