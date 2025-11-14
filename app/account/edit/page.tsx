import Link from "next/link"
import { requireAuth, getUserProfile } from "@/lib/auth/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export const metadata = {
  title: "Edit Profile | Leyla's Apothecary",
}

export default async function EditProfilePage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center space-y-2">
            <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto" />
            <CardTitle className="text-3xl">Profile Editing in Progress</CardTitle>
            <CardDescription className="text-base">
              We&apos;re building the profile management experience. For now, reach out to the Leyla&apos;s team if you need to update your information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Current details</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Name:</span> {profile?.full_name || user.user_metadata?.full_name || "Not set"}</p>
                <p><span className="font-semibold">Email:</span> {user.email}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" className="flex-1">
                <a href="mailto:support@leylasapothecary.com?subject=Profile%20Update%20Request">
                  Contact Support
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/account">
                  Back to Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
