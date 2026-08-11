import imageCompression from 'browser-image-compression'

/**
 * Kompres gambar sebelum upload ke Supabase Storage
 * Max 1MB, max 1920px width/height
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Gagal mengompres gambar:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Generate unique filename for storage
 */
export function generateFileName(originalName) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  return `${timestamp}-${random}.${ext}`
}
