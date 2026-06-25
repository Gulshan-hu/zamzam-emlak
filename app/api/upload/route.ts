import { NextRequest, NextResponse } from 'next/server'
import { uploadListingImage } from '@/lib/upload'
import { getServerUser } from '@/lib/auth-server'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fayl ölçüsü 5MB-dan çox ola bilməz' },
        { status: 400 }
      )
    }

    // Validate MIME type from buffer, not just extension
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Check magic numbers for image types
    let detectedMimeType: string | null = null

    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
      detectedMimeType = 'image/jpeg'
    } else if (
      uint8Array[0] === 0x89 &&
      uint8Array[1] === 0x50 &&
      uint8Array[2] === 0x4E &&
      uint8Array[3] === 0x47
    ) {
      detectedMimeType = 'image/png'
    } else if (
      uint8Array[8] === 0x57 &&
      uint8Array[9] === 0x45 &&
      uint8Array[10] === 0x42 &&
      uint8Array[11] === 0x50
    ) {
      detectedMimeType = 'image/webp'
    }

    if (!detectedMimeType || !ALLOWED_MIME_TYPES.includes(detectedMimeType)) {
      return NextResponse.json(
        { error: 'Yalnız JPEG, PNG və WebP formatları dəstəklənir' },
        { status: 400 }
      )
    }

    const url = await uploadListingImage(file)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: 'Fayl yükləmək mümkün olmadı' },
      { status: 500 }
    )
  }
}
