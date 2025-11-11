import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50 to-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Natural Wellness, Personalized
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium herbal tinctures and custom compounds crafted with expertise and care
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Shop Tinctures
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Premium Tinctures</CardTitle>
                <CardDescription>
                  High-quality herbal extracts for every wellness need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose from 20+ individual herbs across 9 therapeutic categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Compounds</CardTitle>
                <CardDescription>
                  Personalized formulations tailored to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build your own blend or work with our practitioner for bespoke solutions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expert Guidance</CardTitle>
                <CardDescription>
                  Professional naturopathy consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Book a consultation to receive personalized health recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your wellness journey?</h2>
          <p className="text-muted-foreground mb-8">
            Browse our collection of premium herbal tinctures
          </p>
          <Link href="/products">
            <Button size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
