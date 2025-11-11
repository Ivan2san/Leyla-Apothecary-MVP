import { createClient } from '@/lib/supabase/client'
import { Product, ProductCategory } from '@/types'

export class ProductService {
  static async getProducts(filters?: {
    category?: ProductCategory
    search?: string
    limit?: number
    offset?: number
  }) {
    const supabase = createClient()

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      )
    }

    const { data, error } = await query

    if (error) throw error
    return data as Product[]
  }

  static async getProductBySlug(slug: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data as Product
  }

  static async getProductById(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  }

  static async getCategories() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)

    if (error) throw error

    const categories = Array.from(new Set(data.map(p => p.category)))
    return categories as ProductCategory[]
  }

  static async getFeaturedProducts(limit: number = 6) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Product[]
  }

  static async getProductsByCategory(category: ProductCategory) {
    return this.getProducts({ category })
  }

  static async searchProducts(searchTerm: string) {
    return this.getProducts({ search: searchTerm })
  }
}
