"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const heroHooks = [
  {
    title: 'Feeling frustrated that you are still experiencing digestive issues, low energy, or unexplained health concerns even though you are trying everything?',
    label: 'Frustration Hook',
  },
  {
    title: 'Ready to uncover the root cause of your health concerns and create a personalized path to lasting wellness?',
    label: 'Results Hook',
  },
]

export function LandingHero() {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sage/20 via-warm-white to-terracotta/20">
      <div
        className="absolute inset-0 opacity-70"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(163,177,138,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(217,140,74,0.2), transparent 45%)',
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col-reverse gap-10 px-6 py-16 md:flex-row md:items-center md:px-10 lg:px-16">
        <div className="w-full md:w-3/5">
          <p className="font-lora text-sm uppercase tracking-[0.2em] text-forest">
            Leyla&apos;s Apothecary Assessment
          </p>
          <h1 className="mt-4 font-lora text-4xl leading-tight text-forest md:text-5xl">
            Answer 15 questions to discover what&apos;s really holding your health back and get your personalized wellness roadmap.
          </h1>
          <div className="mt-8 space-y-6">
            {heroHooks.map((hook) => (
              <div key={hook.label} className="rounded-2xl border border-forest/10 bg-warm-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
                  {hook.label}
                </p>
                <p className="mt-2 text-lg text-forest/90">{hook.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => router.push('/assessment/questionnaire')}
              className="bg-sage text-forest hover:bg-forest hover:text-warm-white"
              size="lg"
            >
              Start Your Wellness Assessment
            </Button>
            <p className="text-sm text-forest/80">
              Takes just 3-5 minutes · Completely free · Immediate insights
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-2/5">
          <div className="rounded-[32px] border border-forest/10 bg-white/80 p-6 shadow-xl backdrop-blur">
            <div
              className="h-[420px] w-full rounded-3xl bg-cover bg-center"
              aria-hidden
              style={{
                backgroundImage:
                  'linear-gradient(120deg, rgba(52,78,65,0.85), rgba(163,177,138,0.5))',
              }}
            />
            <div className="mt-6 space-y-3">
              <p className="font-lora text-xl text-forest">AI meets Nature</p>
              <p className="text-sm text-forest/80">
                Technology as an invisible guide to natural wellness. Clean, organic, professional—without the woo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
