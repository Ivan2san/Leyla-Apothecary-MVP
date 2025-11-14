import Link from "next/link"
import { AlertTriangle } from "lucide-react"

const baseButton =
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-xl">
        <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto" />
        <div className="space-y-2">
          <p className="uppercase tracking-wide text-sm text-muted-foreground">
            Still brewing
          </p>
          <h1 className="text-4xl font-bold">This page isn&apos;t ready yet</h1>
          <p className="text-muted-foreground">
            Some experiences are still under construction. Check back soon or head to the experiences that are live today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className={`${baseButton} bg-sage text-forest hover:bg-sage/90`}
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className={`${baseButton} border-2 border-sage text-forest bg-transparent hover:bg-sage/10`}
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
