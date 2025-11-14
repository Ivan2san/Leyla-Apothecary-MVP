import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

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
          <Link href="/">
            <Button>
              Go Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
