import { notFound } from 'next/navigation'
import { WellnessPackageService } from '@/lib/services/wellness-packages'
import { JoinPackageCTA } from '@/components/wellness/JoinPackageCTA'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const inclusionLabels: Record<
  string,
  { label: string; detail: string; category: 'Consults' | 'Nervous system' | 'Sauna' | 'Nutrition' }
> = {
  wellness_package_initial: {
    label: 'Initial naturopathic consult',
    detail: '60-minute kickoff session to map your baseline and custom protocol.',
    category: 'Consults',
  },
  dietary_session: {
    label: 'Dietary strategy session',
    detail: '45-minute nutrition + lifestyle deep dive.',
    category: 'Nutrition',
  },
  followup: {
    label: 'Follow-up check-in',
    detail: '30-minute review toward the end of the arc.',
    category: 'Consults',
  },
  meditation_session: {
    label: 'Guided meditation / nervous system reset',
    detail: 'Small-format guided practice to downshift your system.',
    category: 'Nervous system',
  },
  sauna_session: {
    label: 'Infrared sauna session',
    detail: 'Partner clinic credit to keep the detox arc moving.',
    category: 'Sauna',
  },
}

const timeline = [
  {
    title: 'Weeks 0–1',
    items: [
      'Initial naturopathic consult',
      'First meditation + sauna session',
      'Baseline herbal + nutrition protocol',
    ],
  },
  {
    title: 'Weeks 2–3',
    items: [
      'Diet + lifestyle session',
      'Second meditation + nervous system reset',
      'Second sauna session',
    ],
  },
  {
    title: 'Weeks 4–6',
    items: [
      'Follow-up consult & adjustments',
      'Decide on maintenance plan',
      'Optional add-ons or next package',
    ],
  },
]

const formatSessionLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

function formatPriceCents(value: number, currency: string) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100)
}

export const metadata = {
  title: 'Deep Reset Wellness Package',
  description:
    'A 4–6 week structured program combining naturopathic consults, meditation, sauna, and dietary support.',
}

export default async function DeepResetPage() {
  const pkg = await WellnessPackageService.getPackageBySlug('deep_reset')

  if (!pkg) {
    notFound()
  }

  const price = formatPriceCents(pkg.price_cents, pkg.currency)
  const includesEntries = Object.entries(pkg.includes || {})

  return (
    <div className="bg-warm-white">
      <section className="bg-gradient-to-b from-forest/90 to-forest/60 text-white">
        <div className="container mx-auto flex flex-col gap-8 py-16 px-4 md:flex-row md:items-center">
          <div className="md:w-2/3 space-y-4">
            <p className="uppercase tracking-[0.3em] text-xs text-sage/80">
              Wellness Program
            </p>
            <h1 className="font-lora text-4xl md:text-5xl">{pkg.name}</h1>
            <p className="text-lg md:text-xl text-forest/10 text-white/90">
              A 4–6 week guided reset combining naturopathic consults, nervous system work,
              sauna, and personalised nutrition support.
            </p>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Investment</p>
                <p className="text-3xl font-semibold">{price}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Timeline</p>
                <p className="text-3xl font-semibold">{pkg.duration_weeks} weeks</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 bg-white/10 rounded-2xl p-6 shadow-xl backdrop-blur">
            <p className="text-sm text-white/80 mb-4">
              Secure your spot and get instant access to the booking portal plus your welcome email.
            </p>
            <JoinPackageCTA slug={pkg.slug} className="w-full" />
            <p className="mt-4 text-xs text-white/70">
              You&apos;ll be redirected to Stripe checkout. Once payment lands we seed your credits,
              send a welcome pack, and prompt you to book the first consult.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 py-16 px-4 md:grid-cols-2">
        <Card className="border-sage/20">
          <CardHeader>
            <CardTitle className="text-forest">What&apos;s inside</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {includesEntries.map(([key, count]) => {
              const details = inclusionLabels[key] || {
                label: formatSessionLabel(key),
                detail: 'Included session',
                category: 'Consults' as const,
              }
              return (
                <div key={key} className="flex justify-between border-b border-sage/20 pb-3">
                  <div>
                    <p className="font-semibold text-forest">
                      {count} × {details.label}
                    </p>
                    <p className="text-sm text-forest/70">{details.detail}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-forest/60">
                    {details.category}
                  </span>
                </div>
              )
            })}
            <p className="text-sm text-forest/70 pt-2">
              Plus: welcome email with protocol PDF, defined email support boundaries, and a week-three
              nudge if credits remain.
            </p>
          </CardContent>
        </Card>
        <Card className="border-sage/20">
          <CardHeader>
            <CardTitle className="text-forest">Program arc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((segment) => (
              <div key={segment.title} className="rounded-lg border border-sage/30 p-4">
                <p className="font-semibold text-forest mb-2">{segment.title}</p>
                <ul className="list-disc pl-5 text-sm text-forest/80 space-y-1">
                  {segment.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="bg-sage/10 py-16 px-4">
        <div className="container mx-auto grid gap-8 md:grid-cols-3">
          {[
            {
              title: 'Structured but flexible',
              copy:
                'We map the arc, you choose appointment times. Credits stay active for a generous buffer so life can happen.',
            },
            {
              title: 'Everything in one portal',
              copy:
                'Bookings, credits, and reminders all live inside your account—no spreadsheets or inbox juggling.',
            },
            {
              title: 'Built for wired-but-tired humans',
              copy:
                'Ideal if you need a held experience instead of ad-hoc consults. Tapers into ongoing care if needed.',
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-sage/20">
              <CardHeader>
                <CardTitle className="text-forest">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forest/70">{feature.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
