import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-sage/10 to-warm-white">
        <div className="container mx-auto text-center">
          <h1 className="font-lora text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-forest to-sage bg-clip-text text-transparent">
            Natural Wellness, Personalized
          </h1>
          <p className="text-xl text-forest/70 mb-8 max-w-2xl mx-auto">
            Premium herbal tinctures and custom compounds crafted with expertise and care
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-terracotta hover:bg-terracotta/90 text-warm-white">
                Shop Tinctures
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline" className="border-forest text-forest hover:bg-forest hover:text-warm-white">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-warm-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-sage/20 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-forest">Premium Tinctures</CardTitle>
                <CardDescription className="text-forest/60">
                  High-quality herbal extracts for every wellness need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forest/70">
                  Choose from 20+ individual herbs across 9 therapeutic categories
                </p>
              </CardContent>
            </Card>

            <Card className="border-sage/20 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-forest">Custom Compounds</CardTitle>
                <CardDescription className="text-forest/60">
                  Personalized formulations tailored to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forest/70">
                  Build your own blend or work with our practitioner for bespoke solutions
                </p>
              </CardContent>
            </Card>

            <Card className="border-sage/20 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-forest">Expert Guidance</CardTitle>
                <CardDescription className="text-forest/60">
                  Professional naturopathy consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forest/70">
                  Book a consultation to receive personalized health recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-sage/20">
        <div className="container mx-auto text-center">
          <h2 className="font-lora text-3xl font-bold mb-4 text-forest">Ready to start your wellness journey?</h2>
          <p className="text-forest/70 mb-8">
            Browse our collection of premium herbal tinctures
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-terracotta hover:bg-terracotta/90 text-warm-white">
              View All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
