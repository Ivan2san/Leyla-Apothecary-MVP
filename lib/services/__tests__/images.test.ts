import { ImageService } from '../images'
import { createClient } from '@/lib/supabase/server'
import { ProductImageType } from '@/types'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

describe('ImageService', () => {
  let mockSupabase: any
  let queryChain: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create a chainable query mock that is also thenable
    let resolveData: any = { data: null, error: null }

    queryChain = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      upload: jest.fn(),
      remove: jest.fn(),
      then: jest.fn((resolve) => {
        return Promise.resolve(resolveData).then(resolve)
      }),
      _setResolveData: (data: any) => {
        resolveData = data
      },
    }

    // Each method returns the chain
    queryChain.select.mockReturnValue(queryChain)
    queryChain.insert.mockReturnValue(queryChain)
    queryChain.update.mockReturnValue(queryChain)
    queryChain.delete.mockReturnValue(queryChain)
    queryChain.eq.mockReturnValue(queryChain)
    queryChain.single.mockReturnValue(queryChain)
    queryChain.upload.mockReturnValue(queryChain)
    queryChain.remove.mockReturnValue(queryChain)

    mockSupabase = {
      from: jest.fn().mockReturnValue(queryChain),
      storage: {
        from: jest.fn().mockReturnValue(queryChain),
      },
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('validateImage', () => {
    it('should accept valid JPG file', () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PNG file', () => {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid WebP file', () => {
      const file = new File(['dummy'], 'test.webp', { type: 'image/webp' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject GIF file', () => {
      const file = new File(['dummy'], 'test.gif', { type: 'image/gif' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject SVG file', () => {
      const file = new File(['dummy'], 'test.svg', { type: 'image/svg+xml' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject executable file', () => {
      const file = new File(['dummy'], 'test.exe', { type: 'application/x-msdownload' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject file larger than 5MB', () => {
      // Create a 6MB file (6 * 1024 * 1024 bytes)
      const largeContent = new ArrayBuffer(6 * 1024 * 1024)
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size exceeds 5MB')
    })

    it('should accept file at exactly 5MB', () => {
      // Create a 5MB file (exactly at limit)
      const content = new ArrayBuffer(5 * 1024 * 1024)
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file with double extension (.exe.jpg)', () => {
      const file = new File(['dummy'], 'malware.exe.jpg', { type: 'image/jpeg' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('suspicious file name')
    })

    it('should reject file with path traversal attempt', () => {
      const file = new File(['dummy'], '../../../etc/passwd.jpg', { type: 'image/jpeg' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file name')
    })

    it('should validate MIME type matches extension', () => {
      // File claims to be JPG but has GIF MIME type
      const file = new File(['dummy'], 'test.jpg', { type: 'image/gif' })
      const result = ImageService.validateImage(file)
      expect(result.valid).toBe(false)
    })
  })

  describe('uploadImage', () => {
    const mockFile = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' })

    it('should upload image to Supabase Storage', async () => {
      const mockUrl = 'https://storage.supabase.co/product-images/test-123.jpg'
      queryChain._setResolveData({ data: { path: 'test-123.jpg' }, error: null })

      const result = await ImageService.uploadImage(mockFile, 'product-123')

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('product-images')
      expect(queryChain.upload).toHaveBeenCalled()
      expect(result).toMatch(/\.jpg$/)
    })

    it('should generate unique filename with timestamp', async () => {
      jest.useFakeTimers()
      queryChain._setResolveData({ data: { path: 'test-123.jpg' }, error: null })

      await ImageService.uploadImage(mockFile, 'product-123')
      jest.advanceTimersByTime(1000) // Advance by 1 second
      await ImageService.uploadImage(mockFile, 'product-123')

      jest.useRealTimers()

      // Check that upload was called twice with different filenames
      expect(queryChain.upload).toHaveBeenCalledTimes(2)
      const call1Filename = queryChain.upload.mock.calls[0][0]
      const call2Filename = queryChain.upload.mock.calls[1][0]

      // Filenames should be different due to timestamp
      expect(call1Filename).not.toBe(call2Filename)
      // Both should include the product ID
      expect(call1Filename).toMatch(/product-123/)
      expect(call2Filename).toMatch(/product-123/)
    })

    it('should throw error if upload fails', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'Storage quota exceeded' },
      })

      await expect(ImageService.uploadImage(mockFile, 'product-123')).rejects.toThrow(
        'Storage quota exceeded'
      )
    })

    it('should sanitize filename before upload', async () => {
      const fileWithSpaces = new File(['dummy'], 'my photo (1).jpg', { type: 'image/jpeg' })
      queryChain._setResolveData({ data: { path: 'sanitized.jpg' }, error: null })

      await ImageService.uploadImage(fileWithSpaces, 'product-123')

      const uploadCall = queryChain.upload.mock.calls[0]
      const filename = uploadCall[0]

      // Filename should not contain spaces or special chars
      expect(filename).not.toMatch(/[\s()]/)
    })
  })

  describe('deleteImage', () => {
    it('should delete image from Supabase Storage', async () => {
      queryChain._setResolveData({ data: {}, error: null })

      await ImageService.deleteImage('product-123/image-456.jpg')

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('product-images')
      expect(queryChain.remove).toHaveBeenCalledWith(['product-123/image-456.jpg'])
    })

    it('should throw error if deletion fails', async () => {
      queryChain._setResolveData({
        data: null,
        error: { message: 'File not found' },
      })

      await expect(ImageService.deleteImage('product-123/image-456.jpg')).rejects.toThrow(
        'File not found'
      )
    })
  })

  describe('addImageToProduct', () => {
    const mockImage = {
      id: 'img-123',
      url: 'https://storage.supabase.co/product-images/test.jpg',
      alt: 'Product image',
      type: 'primary' as ProductImageType,
      position: 0,
      created_at: new Date().toISOString(),
    }

    it('should add image to product images array', async () => {
      // Mock product with no images
      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: [],
        },
        error: null,
      })

      await ImageService.addImageToProduct('product-123', mockImage)

      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([mockImage]),
        })
      )
    })

    it('should reject adding more than 5 images', async () => {
      // Mock product with 5 images already
      const existingImages = Array.from({ length: 5 }, (_, i) => ({
        ...mockImage,
        id: `img-${i}`,
        position: i,
      }))

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: existingImages,
        },
        error: null,
      })

      await expect(ImageService.addImageToProduct('product-123', mockImage)).rejects.toThrow(
        'Maximum 5 images per product'
      )
    })

    it('should auto-increment position for new images', async () => {
      // Mock product with 2 images (positions 0, 1)
      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: [
            { ...mockImage, id: 'img-1', position: 0 },
            { ...mockImage, id: 'img-2', position: 1 },
          ],
        },
        error: null,
      })

      const newImage = { ...mockImage, position: 2 }
      await ImageService.addImageToProduct('product-123', newImage)

      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ position: 2 }),
          ]),
        })
      )
    })
  })

  describe('removeImageFromProduct', () => {
    it('should remove image from product images array', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Image 1',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'img-2',
          url: 'url2.jpg',
          alt: 'Image 2',
          type: 'lifestyle' as ProductImageType,
          position: 1,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      await ImageService.removeImageFromProduct('product-123', 'img-1')

      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ id: 'img-2' }),
          ]),
        })
      )
      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.not.arrayContaining([
            expect.objectContaining({ id: 'img-1' }),
          ]),
        })
      )
    })

    it('should reorder positions after removal', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Image 1',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'img-2',
          url: 'url2.jpg',
          alt: 'Image 2',
          type: 'lifestyle' as ProductImageType,
          position: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'img-3',
          url: 'url3.jpg',
          alt: 'Image 3',
          type: 'detail' as ProductImageType,
          position: 2,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      await ImageService.removeImageFromProduct('product-123', 'img-2')

      // After removing img-2, img-3 should move to position 1
      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ id: 'img-1', position: 0 }),
            expect.objectContaining({ id: 'img-3', position: 1 }),
          ]),
        })
      )
    })
  })

  describe('updateImageMetadata', () => {
    it('should update image alt text', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Old alt text',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      await ImageService.updateImageMetadata('product-123', 'img-1', {
        alt: 'New alt text',
      })

      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ id: 'img-1', alt: 'New alt text' }),
          ]),
        })
      )
    })

    it('should update image type', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Image 1',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      await ImageService.updateImageMetadata('product-123', 'img-1', {
        type: 'lifestyle' as ProductImageType,
      })

      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ id: 'img-1', type: 'lifestyle' }),
          ]),
        })
      )
    })
  })

  describe('reorderImages', () => {
    it('should update positions of all images', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Image 1',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'img-2',
          url: 'url2.jpg',
          alt: 'Image 2',
          type: 'lifestyle' as ProductImageType,
          position: 1,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      // Swap order: img-2 first, img-1 second
      await ImageService.reorderImages('product-123', ['img-2', 'img-1'])

      expect(queryChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ id: 'img-2', position: 0 }),
            expect.objectContaining({ id: 'img-1', position: 1 }),
          ]),
        })
      )
    })

    it('should throw error if image IDs do not match existing images', async () => {
      const mockImages = [
        {
          id: 'img-1',
          url: 'url1.jpg',
          alt: 'Image 1',
          type: 'primary' as ProductImageType,
          position: 0,
          created_at: new Date().toISOString(),
        },
      ]

      queryChain._setResolveData({
        data: {
          id: 'product-123',
          images: mockImages,
        },
        error: null,
      })

      await expect(
        ImageService.reorderImages('product-123', ['img-1', 'img-999'])
      ).rejects.toThrow('Invalid image IDs')
    })
  })
})
