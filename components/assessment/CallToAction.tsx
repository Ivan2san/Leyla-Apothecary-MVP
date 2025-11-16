import { Button } from '@/components/ui/button'

const benefits = [
  'Takes just 3-5 minutes to complete',
  'Completely free – no credit card required',
  'Receive immediate personalized insights',
  'Discover your recommended next steps',
]

export function CallToAction() {
  return (
    <section className="bg-forest text-warm-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-12 text-center md:flex-row md:text-left">
        <div className="flex-1 space-y-4">
          <p className="font-lora text-3xl">Ready to meet your wellness baseline?</p>
          <p className="text-warm-white/80">
            Answer 15 thoughtful questions and receive Leyla&apos;s recommendations based on your personal results.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-warm-white/90 md:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span aria-hidden className="text-sage">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="bg-sage text-forest hover:bg-warm-white">
            <a href="/assessment/questionnaire">Start Your Wellness Assessment</a>
          </Button>
          <p className="text-xs uppercase tracking-[0.3em] text-warm-white/60">
            Mobile friendly · Secure · Personalized
          </p>
        </div>
      </div>
    </section>
  )
}
