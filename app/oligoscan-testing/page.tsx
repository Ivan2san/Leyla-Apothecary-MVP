import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Oligoscan Intracellular Testing | Leyla’s Apothecary',
  description:
    'Learn how Leyla uses Oligoscan spectroscopy to map intracellular minerals, vitamins, and heavy metals for personalised naturopathic care.',
}

const quickFacts = [
  { label: 'What it measures', value: '21 minerals, 16 heavy metals, 7 vitamins' },
  { label: 'Technology', value: 'Spectroscopy at 4mm skin depth' },
  { label: 'Scan duration', value: 'Under 10 minutes' },
  { label: 'Results', value: 'Discussed immediately in-session' },
]

const compares = [
  {
    title: 'Oligoscan',
    description:
      'Shows what your body has accumulated in tissue — the mineral and heavy metal story living inside cells.',
  },
  {
    title: 'Blood work',
    description:
      'Shows what is circulating this week. Great for acute snapshots but not intracellular stores.',
  },
  {
    title: 'Hair / urine tests',
    description:
      'Show what the body is excreting. Useful for detox insights but not always correlated with tissue burden.',
  },
]

const faqs = [
  {
    question: 'Is Oligoscan a lab test?',
    answer:
      "It's a medical-grade spectroscopy scan performed in person. No needles, no lab wait, and everything is logged in your Leyla dashboard afterwards.",
  },
  {
    question: 'Do I get a report?',
    answer:
      'Yes — Leyla documents your key findings, categories, and next steps in your client dashboard within a few days. No PDFs to chase.',
  },
  {
    question: 'How do I prepare?',
    answer: 'Arrive hydrated, skip hand creams the day of, and bring any supplements or lab results you want to reference.',
  },
]

export default function OligoscanTestingPage() {
  return (
    <div className="bg-stone-50 py-16">
      <div className="container mx-auto max-w-5xl space-y-12 px-4">
        <header className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Spectroscopy-guided care</p>
          <h1 className="font-serif text-4xl text-forest md:text-5xl">
            Oligoscan: intracellular mineral & heavy metal testing
          </h1>
          <p className="text-base text-forest/80 md:text-lg">
            A handheld spectrometer maps your tissue stores in real time so Leyla can connect symptoms with
            actual cellular mineral status. No needles, no guessing — just data-backed herbal strategy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-terracotta text-white hover:bg-terracotta/90">
              <Link href="/booking?type=oligoscan_assessment">Book Oligoscan Consultation</Link>
            </Button>
            <Button asChild variant="outline" className="text-forest">
              <Link href="/booking">Explore other consultations</Link>
            </Button>
          </div>
        </header>

        <Card className="border-sage/30 bg-white">
          <CardHeader>
            <CardTitle className="text-forest">How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 text-sm text-forest/80">
              <p>
                Oligoscan uses spectroscopy based on the Beer–Lambert law: each element absorbs light at a specific
                wavelength. By projecting a calibrated light spectrum through the palm, the scanner reads how much
                energy your tissue absorbs and reflects for each mineral, vitamin, and heavy metal.
              </p>
              <p>
                The scan takes less than 10 minutes and captures what&apos;s happening inside your cells — not just
                what&apos;s circulating or being excreted. That intracellular clarity helps Leyla fine-tune detox,
                remineralisation, and nervous system protocols.
              </p>
            </div>
            <div className="space-y-4 rounded-lg border border-sage/30 p-4">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-forest/70">{fact.label}</span>
                  <span className="text-forest">{fact.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {compares.map((entry) => (
            <Card key={entry.title} className="border-sage/30">
              <CardHeader>
                <CardTitle className="text-terracotta text-lg">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forest/80">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-sage/30">
          <CardHeader>
            <CardTitle className="text-forest">Who benefits?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-forest/80 space-y-4">
            <p>Oligoscan slots neatly into Leyla&apos;s care for people who:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Have chronic fatigue, anxiety, sleep disturbances, or hormonal shifts tied to mineral imbalance.</li>
              <li>Suspect heavy metal burden from dental work, industrial exposure, or past toxicity.</li>
              <li>Feel stuck despite “normal” blood work and want to see intracellular data.</li>
              <li>Are rebuilding after pregnancy, burnout, or longstanding stress.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-sage/30 bg-white">
          <CardHeader>
            <CardTitle className="text-forest">Frequently asked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-forest/80">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <p className="font-semibold">{faq.question}</p>
                <p className="text-sm">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="rounded-2xl border border-terracotta/40 bg-terracotta/5 p-8 text-center space-y-4">
          <h2 className="font-serif text-3xl text-forest">Ready to see your intracellular story?</h2>
          <p className="text-forest/80">
            Book an Oligoscan session and leave with an interpreted scorecard plus next steps logged inside your client dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-terracotta text-white hover:bg-terracotta/90">
              <Link href="/booking?type=oligoscan_assessment">Reserve your scan</Link>
            </Button>
            <Button asChild variant="outline" className="text-forest">
              <Link href="/account">Visit dashboard</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
