"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { AuthNav } from "@/components/layout/auth-nav"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sage/20 bg-warm-white/95 backdrop-blur supports-[backdrop-filter]:bg-warm-white/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-lora font-bold text-xl bg-gradient-to-r from-forest to-sage bg-clip-text text-transparent">
            Leyla&apos;s Apothecary
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/products"
            className="transition-colors hover:text-forest text-forest/70"
          >
            Products
          </Link>
          <Link
            href="/booking"
            className="transition-colors hover:text-forest text-forest/70"
          >
            Book Consultation
          </Link>
          <Link
            href="/compounds"
            className="transition-colors hover:text-forest text-forest/70"
          >
            Custom Compounds
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-forest text-forest/70"
          >
            About
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Cart */}
          <CartDrawer />

          {/* Account / Auth */}
          <AuthNav />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-3 p-4">
            <Link
              href="/products"
              className="text-forest/70 hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/booking"
              className="text-forest/70 hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Consultation
            </Link>
            <Link
              href="/compounds"
              className="text-forest/70 hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Custom Compounds
            </Link>
            <Link
              href="/about"
              className="text-forest/70 hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
