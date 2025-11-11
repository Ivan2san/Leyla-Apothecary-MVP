"use client"

import Link from "next/link"
import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Leyla&apos;s Apothecary
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/products"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Products
          </Link>
          <Link
            href="/booking"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Book Consultation
          </Link>
          <Link
            href="/compounds"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Custom Compounds
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            About
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Cart */}
          <CartDrawer />

          {/* Account */}
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>

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
              className="text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/booking"
              className="text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Consultation
            </Link>
            <Link
              href="/compounds"
              className="text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Custom Compounds
            </Link>
            <Link
              href="/about"
              className="text-foreground/60 hover:text-foreground transition-colors"
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
