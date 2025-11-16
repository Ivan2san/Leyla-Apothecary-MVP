import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile basics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile information' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        profile: {
          dateOfBirth: data?.date_of_birth ?? null,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error in GET /api/profile/basic:', err)
    return NextResponse.json(
      { error: 'Failed to fetch profile information' },
      { status: 500 }
    )
  }
}
