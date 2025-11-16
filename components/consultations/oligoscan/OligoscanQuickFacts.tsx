"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OligoscanQuickFacts() {
  return (
    <Card className="border-terracotta/40 bg-white">
      <CardHeader>
        <CardTitle className="text-terracotta text-base">Quick Facts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-forest/80">
        <div>
          <p className="font-semibold text-forest">Measures</p>
          <p>21 minerals, 16 heavy metals, 7 vitamins</p>
        </div>
        <div>
          <p className="font-semibold text-forest">Why biometrics?</p>
          <p>They anchor your results to the right profile and improve interpretation accuracy.</p>
        </div>
        <div>
          <p className="font-semibold text-forest">Prep tips</p>
          <ul className="list-disc pl-5">
            <li>No hand creams on scan day</li>
            <li>Hydrate well</li>
            <li>Bring supplement list if possible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
