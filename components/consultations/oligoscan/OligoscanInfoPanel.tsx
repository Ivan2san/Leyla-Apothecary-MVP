"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OligoscanInfoPanel() {
  return (
    <Card className="border-sage/30 bg-sage/5">
      <CardHeader>
        <CardTitle className="text-forest text-lg">What is Oligoscan?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-forest/80">
        <p>
          Oligoscan is a spectroscopy-based assessment that measures the intracellular levels of
          minerals, vitamins, and heavy metals by analyzing light absorption in tissue. It delivers
          immediate, non-invasive readings that show what your cells have actually absorbed.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Instant mineral, vitamin, and heavy metal profile with no needles or lab waits.</li>
          <li>Helps correlate energetic, digestive, and detox symptoms with nutrient status.</li>
          <li>Pairs with Leyla&apos;s naturopathic consultation for targeted herbal strategies.</li>
        </ul>
        <p className="text-xs text-forest/60">
          The scan is performed in person during your booking. Biometrics collected here simply help
          Leyla prepare and ensure your results are stored accurately.
        </p>
      </CardContent>
    </Card>
  )
}
