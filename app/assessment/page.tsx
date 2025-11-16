import type { Metadata } from 'next'
import { LandingHero } from '@/components/assessment/LandingHero'
import { ValueProposition } from '@/components/assessment/ValueProposition'
import { Credibility } from '@/components/assessment/Credibility'
import { CallToAction } from '@/components/assessment/CallToAction'

export const metadata: Metadata = {
  title: "Leyla's Apothecary Wellness Assessment",
  description:
    "Discover your wellness baseline with Leyla's 15-question assessment covering gut health, toxic load, and lifestyle foundations.",
}

export default function AssessmentLandingPage() {
  return (
    <div className="bg-warm-white">
      <LandingHero />
      <ValueProposition />
      <Credibility />
      <CallToAction />
    </div>
  )
}
