import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroBanner } from "@/components/ui/hero-banner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NewsletterSignup } from "@/components/marketing/newsletter-signup"
import { getHeroAsset } from "@/lib/visual/hero-config"

export default async function Home() {
  const heroAsset = await getHeroAsset("home")

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner
        title="Natural Wellness, Personalized"
        subtitle="Welcome to Leyla's Apothecary"
        description="Premium herbal tinctures and custom compounds crafted with expertise and care"
        imageSrc={heroAsset.desktopSrc ?? "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2940"}
        mobileImageSrc={heroAsset.mobileSrc}
        imageAlt="Herbal medicine bottles and fresh herbs"
        primaryCTA={{
          text: "Shop Tinctures",
          href: "/products",
        }}
        secondaryCTA={{
          text: "Book Consultation",
          href: "/booking",
        }}
        height="large"
        textAlign="center"
        overlay={heroAsset.overlay}
        withTexture
      />

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

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-warm-white">
        <div className="container mx-auto max-w-5xl">
          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}
