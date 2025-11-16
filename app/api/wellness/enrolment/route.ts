import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WellnessPackageService } from '@/lib/services/wellness-packages'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ enrolment: null }, { status: 200 })
    }

    const enrolment = await WellnessPackageService.getActiveEnrolment(user.id)

    return NextResponse.json({ enrolment }, { status: 200 })
  } catch (error) {
    console.error('Error fetching wellness package enrolment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package enrolment' },
      { status: 500 }
    )
  }
}
