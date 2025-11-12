import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-sage/20 bg-forest text-warm-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-lora font-bold text-lg text-sage">Leyla&apos;s Apothecary</h3>
            <p className="text-sm text-warm-white/80">
              Premium herbal tinctures and personalized wellness solutions.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sage">Shop</h4>
            <ul className="space-y-2 text-sm text-warm-white/80">
              <li>
                <Link href="/products" className="hover:text-terracotta transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=digestive" className="hover:text-terracotta transition-colors">
                  Digestive Health
                </Link>
              </li>
              <li>
                <Link href="/products?category=immune" className="hover:text-terracotta transition-colors">
                  Immune Support
                </Link>
              </li>
              <li>
                <Link href="/compounds" className="hover:text-terracotta transition-colors">
                  Custom Compounds
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sage">Services</h4>
            <ul className="space-y-2 text-sm text-warm-white/80">
              <li>
                <Link href="/booking" className="hover:text-terracotta transition-colors">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-terracotta transition-colors">
                  About Leyla
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-terracotta transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sage">Legal</h4>
            <ul className="space-y-2 text-sm text-warm-white/80">
              <li>
                <Link href="/privacy" className="hover:text-terracotta transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-terracotta transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-terracotta transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-terracotta transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-sage/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-warm-white/70">
          <p>© {currentYear} Leyla&apos;s Apothecary. All rights reserved.</p>
          <p className="text-xs">
            *These statements have not been evaluated by the TGA. These products are not intended to diagnose, treat, cure or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  )
}
