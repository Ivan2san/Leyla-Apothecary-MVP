import { createClient } from '@/lib/supabase/server'
import type { NewsletterSubscribeInput } from '@/lib/validations/newsletter'

interface SubscribeResult {
  id: string
  email: string
  name?: string | null
  subscribed: boolean
  tags: string[]
  created_at: string
}

/**
 * Handles newsletter subscription persistence via Supabase.
 */
export class NewsletterService {
  static async subscribe(input: NewsletterSubscribeInput) {
    const supabase = await createClient()

    const payload = {
      email: input.email.toLowerCase(),
      name: input.name?.trim() || null,
      subscribed: true,
      tags: input.tags ?? [],
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(payload, {
        onConflict: 'email',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to subscribe to newsletter')
    }

    return data as SubscribeResult
  }
}
