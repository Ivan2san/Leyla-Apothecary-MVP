import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingsList } from '@/components/booking/BookingsList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'My Consultations | Leyla\'s Apothecary',
  description: 'View and manage your naturopathy consultation bookings',
}

export default async function BookingsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?redirect=/account/bookings')
  }

  return (
    <div className="min-h-screen bg-warm-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-lora font-bold text-forest mb-2">
              My Consultations
            </h1>
            <p className="text-forest/70">
              View and manage your upcoming and past consultations
            </p>
          </div>

          <Link href="/booking">
            <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Book New
            </Button>
          </Link>
        </div>

        <BookingsList />
      </div>
    </div>
  )
}
