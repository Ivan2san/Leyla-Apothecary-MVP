import { POST, DELETE } from '../route'
import { createClient } from '@/lib/supabase/server'
import { ImageService } from '@/lib/services/images'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/services/images')

// Helper to create mock request with file upload
function createMockRequest(formData: FormData, method: string = 'POST') {
  return {
    formData: jest.fn().mockResolvedValue(formData),
    method,
  } as any
}

describe('POST /api/products/[id]/images', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user is not admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          user_metadata: { role: 'customer' }, // Not admin
        },
      },
      error: null,
    })

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden: Admin access required')
  })

  it('should return 400 if no file is provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    const formData = new FormData()
    // No file attached

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('No file provided')
  })

  it('should return 400 for invalid file format', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    // Mock validation failure
    ;(ImageService.validateImage as jest.Mock).mockReturnValue({
      valid: false,
      error: 'Invalid file type: image/gif. Only JPG, PNG, and WebP are allowed.',
    })

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.gif', { type: 'image/gif' }))

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid file type')
  })

  it('should return 413 for file too large', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    // Mock validation failure for file size
    ;(ImageService.validateImage as jest.Mock).mockReturnValue({
      valid: false,
      error: 'File size exceeds 5MB limit. Your file is 6.50MB',
    })

    const formData = new FormData()
    formData.append('file', new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }))

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(413)
    expect(data.error).toContain('File size exceeds')
  })

  it('should return 400 when product already has 5 images', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    ;(ImageService.validateImage as jest.Mock).mockReturnValue({ valid: true })
    ;(ImageService.uploadImage as jest.Mock).mockResolvedValue('product-123/test.jpg')
    ;(ImageService.getPublicUrl as jest.Mock).mockResolvedValue('https://storage.example.com/test.jpg')
    ;(ImageService.addImageToProduct as jest.Mock).mockRejectedValue(
      new Error('Maximum 5 images per product. Please delete an existing image first.')
    )

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Maximum 5 images')
  })

  it('should successfully upload image for admin user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    const mockStoragePath = 'product-123/test-123456.jpg'
    const mockPublicUrl = 'https://storage.supabase.co/product-images/product-123/test-123456.jpg'

    ;(ImageService.validateImage as jest.Mock).mockReturnValue({ valid: true })
    ;(ImageService.uploadImage as jest.Mock).mockResolvedValue(mockStoragePath)
    ;(ImageService.getPublicUrl as jest.Mock).mockResolvedValue(mockPublicUrl)
    ;(ImageService.addImageToProduct as jest.Mock).mockResolvedValue(undefined)

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))
    formData.append('alt', 'Product image')
    formData.append('type', 'primary')

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.image).toBeDefined()
    expect(data.image.url).toBe(mockPublicUrl)
    expect(data.image.alt).toBe('Product image')
    expect(data.image.type).toBe('primary')
    expect(ImageService.uploadImage).toHaveBeenCalledWith(expect.any(File), 'product-123')
    expect(ImageService.addImageToProduct).toHaveBeenCalledWith(
      'product-123',
      expect.objectContaining({
        url: mockPublicUrl,
        alt: 'Product image',
        type: 'primary',
      })
    )
  })

  it('should use default alt text if not provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    ;(ImageService.validateImage as jest.Mock).mockReturnValue({ valid: true })
    ;(ImageService.uploadImage as jest.Mock).mockResolvedValue('product-123/test.jpg')
    ;(ImageService.getPublicUrl as jest.Mock).mockResolvedValue('https://storage.example.com/test.jpg')
    ;(ImageService.addImageToProduct as jest.Mock).mockResolvedValue(undefined)

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))
    // No alt text provided

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(ImageService.addImageToProduct).toHaveBeenCalledWith(
      'product-123',
      expect.objectContaining({
        alt: 'Product image',
      })
    )
  })

  it('should use default type "primary" if not provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    ;(ImageService.validateImage as jest.Mock).mockReturnValue({ valid: true })
    ;(ImageService.uploadImage as jest.Mock).mockResolvedValue('product-123/test.jpg')
    ;(ImageService.getPublicUrl as jest.Mock).mockResolvedValue('https://storage.example.com/test.jpg')
    ;(ImageService.addImageToProduct as jest.Mock).mockResolvedValue(undefined)

    const formData = new FormData()
    formData.append('file', new File(['dummy'], 'test.jpg', { type: 'image/jpeg' }))
    // No type provided

    const request = createMockRequest(formData)
    const response = await POST(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(ImageService.addImageToProduct).toHaveBeenCalledWith(
      'product-123',
      expect.objectContaining({
        type: 'primary',
      })
    )
  })
})

describe('DELETE /api/products/[id]/images/[imageId]', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const request = { method: 'DELETE' } as any
    const response = await DELETE(request, {
      params: { id: 'product-123', imageId: 'img-456' },
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user is not admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          user_metadata: { role: 'customer' },
        },
      },
      error: null,
    })

    const request = { method: 'DELETE' } as any
    const response = await DELETE(request, {
      params: { id: 'product-123', imageId: 'img-456' },
    })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden: Admin access required')
  })

  it('should successfully delete image for admin user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    ;(ImageService.removeImageFromProduct as jest.Mock).mockResolvedValue(undefined)

    const request = { method: 'DELETE' } as any
    const response = await DELETE(request, {
      params: { id: 'product-123', imageId: 'img-456' },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(ImageService.removeImageFromProduct).toHaveBeenCalledWith('product-123', 'img-456')
  })

  it('should return 404 if image not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' },
        },
      },
      error: null,
    })

    ;(ImageService.removeImageFromProduct as jest.Mock).mockRejectedValue(new Error('Image not found'))

    const request = { method: 'DELETE' } as any
    const response = await DELETE(request, {
      params: { id: 'product-123', imageId: 'img-999' },
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toContain('Image not found')
  })
})
