import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { removeAgentFromAgency } from '@/lib/agency'
import { z } from 'zod'

const removeAgentSchema = z.object({
  userId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = removeAgentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Yanlış məlumat formatı' },
        { status: 400 }
      )
    }

    const { userId } = validationResult.data

    // Verify user is AGENCY_OWNER
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, agencyId: true },
    })

    if (!dbUser || dbUser.role !== 'AGENCY_OWNER' || !dbUser.agencyId) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    // Verify target user belongs to same agency
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { agencyId: true },
    })

    if (!targetUser || targetUser.agencyId !== dbUser.agencyId) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    const success = await removeAgentFromAgency(userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Agent çıxarıla bilmədi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove agent:', error)
    return NextResponse.json(
      { error: 'Agent çıxarıla bilmədi' },
      { status: 500 }
    )
  }
}
