import { notFound, redirect } from 'next/navigation'
import { WellnessPackageService } from '@/lib/services/wellness-packages'
import { PackageCheckoutConfirmation } from '@/components/wellness/PackageCheckoutConfirmation'

type SuccessPageProps = {
  params: { slug: string }
  searchParams: { session_id?: string }
}

export default async function WellnessPackageSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = params
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect(`/wellness/${slug}`)
  }

  const pkg = await WellnessPackageService.getPackageBySlug(slug)
  if (!pkg) {
    notFound()
  }

  return (
    <div className="bg-warm-white py-16">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-forest/60">
          Wellness package
        </p>
        <h1 className="mt-2 font-lora text-4xl text-forest">Payment received</h1>
        <p className="mt-4 text-forest/70">
          We&apos;re activating your credits for the {pkg.name}. Hang tight while we confirm your checkout
          and seed the booking dashboard.
        </p>
        <div className="mt-10">
          <PackageCheckoutConfirmation sessionId={sessionId} packageSlug={pkg.slug} />
        </div>
      </div>
    </div>
  )
}
