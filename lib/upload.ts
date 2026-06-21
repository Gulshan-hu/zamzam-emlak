import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadListingImage(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed')
  }

  const supabase = await createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('listing-images').getPublicUrl(data.path)

  return publicUrl
}

export async function uploadMultipleListingImages(
  files: File[]
): Promise<string[]> {
  if (files.length > 10) {
    throw new Error('Maximum 10 images allowed')
  }

  const uploadPromises = files.map((file) => uploadListingImage(file))
  return Promise.all(uploadPromises)
}

export async function deleteListingImage(url: string): Promise<void> {
  const supabase = await createClient()

  // Extract path from URL
  const urlParts = url.split('/listing-images/')
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL')
  }

  const path = urlParts[1]

  const { error } = await supabase.storage.from('listing-images').remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
