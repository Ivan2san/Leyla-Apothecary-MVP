import { HeroBanner } from "@/components/ui/hero-banner"
import { BookingForm } from "@/components/booking/BookingForm"

export const metadata = {
  title: 'Book a Consultation | Leyla\'s Apothecary',
  description: 'Schedule a personalized naturopathy consultation with Leyla. Choose from initial, follow-up, or quick consultations.',
}

export default function BookingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner
        title="Book Your Consultation"
        subtitle="Natural Health Guidance"
        description="Schedule a personalized consultation to discuss your health goals and receive expert naturopathic care"
        imageSrc="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2940"
        imageAlt="Peaceful consultation space with natural elements"
        height="medium"
        textAlign="center"
        overlay="dark"
      />

      {/* Booking Form Section */}
      <section className="py-16 px-4 bg-warm-white">
        <div className="container mx-auto">
          <BookingForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4 bg-sage/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-lora font-bold text-forest mb-6 text-center">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold text-forest mb-2">Select Your Time</h3>
              <p className="text-sm text-forest/70">
                Choose a consultation type and available time slot that works for you
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold text-forest mb-2">Receive Confirmation</h3>
              <p className="text-sm text-forest/70">
                Get a confirmation email with your meeting link and preparation tips
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold text-forest mb-2">Meet with Leyla</h3>
              <p className="text-sm text-forest/70">
                Join your virtual consultation and receive personalized health guidance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
