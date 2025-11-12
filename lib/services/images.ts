import { createClient } from '@/lib/supabase/server'
import { ProductImage, ProductImageType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGES_PER_PRODUCT = 5

interface ValidationResult {
  valid: boolean
  error?: string
}

export class ImageService {
  /**
   * Validate image file before upload
   */
  static validateImage(file: File): ValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      }
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Only JPG, PNG, and WebP are allowed.`,
      }
    }

    // Check for suspicious file names (double extensions, path traversal)
    const filename = file.name.toLowerCase()

    // Check for path traversal
    if (filename.includes('../') || filename.includes('..\\')) {
      return {
        valid: false,
        error: 'Invalid file name: path traversal detected',
      }
    }

    // Check for double extensions (.exe.jpg)
    const parts = filename.split('.')
    if (parts.length > 2) {
      const suspiciousExtensions = ['exe', 'bat', 'cmd', 'sh', 'php', 'asp', 'aspx', 'jsp']
      const hasExecutableExt = parts.some((part) => suspiciousExtensions.includes(part))
      if (hasExecutableExt) {
        return {
          valid: false,
          error: 'Invalid file name: suspicious file name detected',
        }
      }
    }

    // Validate MIME type matches extension
    const extension = parts[parts.length - 1]
    const mimeTypeMap: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
    }

    const expectedExtensions = mimeTypeMap[file.type]
    if (!expectedExtensions || !expectedExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'MIME type does not match file extension',
      }
    }

    return { valid: true }
  }

  /**
   * Sanitize filename for safe storage
   */
  private static sanitizeFilename(filename: string): string {
    // Remove path, keep only filename
    const baseFilename = filename.replace(/^.*[\\/]/, '')

    // Replace spaces and special chars with hyphens
    const sanitized = baseFilename
      .toLowerCase()
      .replace(/[^\w.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return sanitized
  }

  /**
   * Upload image to Supabase Storage
   * Returns the storage path
   */
  static async uploadImage(file: File, productId: string): Promise<string> {
    const supabase = await createClient()

    // Generate unique filename
    const extension = file.name.split('.').pop()
    const sanitizedName = this.sanitizeFilename(file.name.replace(`.${extension}`, ''))
    const timestamp = Date.now()
    const uniqueId = uuidv4().split('-')[0]
    const filename = `${productId}/${sanitizedName}-${timestamp}-${uniqueId}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }

    return data.path
  }

  /**
   * Delete image from Supabase Storage
   */
  static async deleteImage(storagePath: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath])

    if (error) {
      throw new Error(`Image deletion failed: ${error.message}`)
    }
  }

  /**
   * Get public URL for image from storage path
   */
  static async getPublicUrl(storagePath: string): Promise<string> {
    const supabase = await createClient()

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

    return data.publicUrl
  }

  /**
   * Add image to product's images array
   */
  static async addImageToProduct(
    productId: string,
    image: ProductImage
  ): Promise<void> {
    const supabase = await createClient()

    // Fetch current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`)
    }

    const currentImages = (product.images as ProductImage[]) || []

    // Check maximum images limit
    if (currentImages.length >= MAX_IMAGES_PER_PRODUCT) {
      throw new Error(
        `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product. Please delete an existing image first.`
      )
    }

    // Add new image
    const updatedImages = [...currentImages, image]

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', productId)

    if (updateError) {
      throw new Error(`Failed to add image to product: ${updateError.message}`)
    }
  }

  /**
   * Remove image from product's images array and delete from storage
   */
  static async removeImageFromProduct(
    productId: string,
    imageId: string
  ): Promise<void> {
    const supabase = await createClient()

    // Fetch current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`)
    }

    const currentImages = (product.images as ProductImage[]) || []

    // Find and remove image
    const imageToRemove = currentImages.find((img) => img.id === imageId)
    if (!imageToRemove) {
      throw new Error('Image not found')
    }

    const updatedImages = currentImages
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({ ...img, position: index })) // Reorder positions

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', productId)

    if (updateError) {
      throw new Error(`Failed to remove image from product: ${updateError.message}`)
    }

    // Delete from storage (extract path from URL)
    const storagePath = imageToRemove.url.split(`${BUCKET_NAME}/`)[1]
    if (storagePath) {
      await this.deleteImage(storagePath)
    }
  }

  /**
   * Update image metadata (alt text, type)
   */
  static async updateImageMetadata(
    productId: string,
    imageId: string,
    updates: Partial<Pick<ProductImage, 'alt' | 'type'>>
  ): Promise<void> {
    const supabase = await createClient()

    // Fetch current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`)
    }

    const currentImages = (product.images as ProductImage[]) || []

    // Update image metadata
    const updatedImages = currentImages.map((img) =>
      img.id === imageId ? { ...img, ...updates } : img
    )

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', productId)

    if (updateError) {
      throw new Error(`Failed to update image metadata: ${updateError.message}`)
    }
  }

  /**
   * Reorder images by updating their positions
   */
  static async reorderImages(productId: string, imageIds: string[]): Promise<void> {
    const supabase = await createClient()

    // Fetch current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`)
    }

    const currentImages = (product.images as ProductImage[]) || []

    // Validate that all imageIds exist
    const existingIds = currentImages.map((img) => img.id)
    const allIdsExist = imageIds.every((id) => existingIds.includes(id))
    if (!allIdsExist || imageIds.length !== currentImages.length) {
      throw new Error('Invalid image IDs provided for reordering')
    }

    // Reorder images based on new order
    const updatedImages = imageIds.map((id, index) => {
      const image = currentImages.find((img) => img.id === id)!
      return { ...image, position: index }
    })

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', productId)

    if (updateError) {
      throw new Error(`Failed to reorder images: ${updateError.message}`)
    }
  }
}
