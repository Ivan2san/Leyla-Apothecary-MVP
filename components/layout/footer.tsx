import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Leyla&apos;s Apothecary</h3>
            <p className="text-sm text-muted-foreground">
              Premium herbal tinctures and personalized wellness solutions.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=digestive" className="hover:text-foreground transition-colors">
                  Digestive Health
                </Link>
              </li>
              <li>
                <Link href="/products?category=immune" className="hover:text-foreground transition-colors">
                  Immune Support
                </Link>
              </li>
              <li>
                <Link href="/compounds" className="hover:text-foreground transition-colors">
                  Custom Compounds
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/booking" className="hover:text-foreground transition-colors">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Leyla
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Leyla&apos;s Apothecary. All rights reserved.</p>
          <p className="text-xs">
            *These statements have not been evaluated by the TGA. These products are not intended to diagnose, treat, cure or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  )
}
