import { requireAuth, getUserProfile } from "@/lib/auth/auth-helpers"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Package, User as UserIcon, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth/actions"
import { WellnessPackageService } from "@/lib/services/wellness-packages"

async function handleSignOut() {
  "use server"
  await signOut()
}

async function getOrders(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data
}

async function getOligoscanAssessments(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'oligoscan_v1')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching Oligoscan assessments:', error)
    return []
  }

  return data ?? []
}

export default async function AccountPage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  const orders = await getOrders(user.id)
  const enrolments = await WellnessPackageService.getEnrolmentsForUser(user.id)
  const oligoscanAssessments = await getOligoscanAssessments(user.id)

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">
              Manage your account and view your order history
            </p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {profile?.full_name || user.user_metadata?.full_name || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {formatDate(user.created_at, 'short')}
                </p>
              </div>
              <Link href="/account/edit">
                <Button variant="outline" className="w-full mt-4">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>Your shopping summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {orders.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Orders
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Delivered
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(
                        orders.reduce((sum, order) => sum + order.total_amount, 0)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Spent
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>Oligoscan results and practitioner notes</CardDescription>
          </CardHeader>
          <CardContent>
            {oligoscanAssessments.length === 0 ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>No assessment results yet.</p>
                <Link href="/oligoscan-testing" className="text-terracotta underline">
                  Learn about Oligoscan testing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {oligoscanAssessments.map((assessment) => {
                  const responses = (assessment.responses as any) || {}
                  const keyFindings =
                    Array.isArray(responses.keyFindings) &&
                    responses.keyFindings.every((finding: unknown) => typeof finding === 'string')
                      ? (responses.keyFindings as string[]).slice(0, 3)
                      : []
                  const categories = responses.categories || {}

                  return (
                    <div key={assessment.id} className="rounded-lg border border-sage/30 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-forest">Oligoscan assessment</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(assessment.created_at, 'long')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Overall score
                          </p>
                          <p className="text-2xl font-bold text-terracotta">
                            {assessment.score?.toFixed(1) ?? '—'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Key findings
                        </p>
                        <ul className="list-disc pl-5 text-sm text-forest/80">
                          {keyFindings.length === 0 && <li>Recorded findings unavailable.</li>}
                          {keyFindings.map((finding) => (
                            <li key={finding}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      <details className="mt-4 rounded-md border border-sage/30 bg-muted/30 p-3 text-sm text-forest/80">
                        <summary className="cursor-pointer font-medium text-forest">
                          View practitioner summary
                        </summary>
                        <p className="mt-2">{responses.summary || 'No summary provided.'}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Minerals
                            </p>
                            <p className="font-semibold">
                              {categories.minerals?.status?.replace(/_/g, ' ') ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {categories.minerals?.notes ?? ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Heavy metals
                            </p>
                            <p className="font-semibold">
                              {categories.heavyMetals?.status?.replace(/_/g, ' ') ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {categories.heavyMetals?.notes ?? ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Vitamins
                            </p>
                            <p className="font-semibold">
                              {categories.vitamins?.status?.replace(/_/g, ' ') ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {categories.vitamins?.notes ?? ''}
                            </p>
                          </div>
                        </div>
                      </details>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Packages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Programs & Packages</CardTitle>
            <CardDescription>Track your enrolments and remaining credits</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolments.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-sm text-muted-foreground">
                  No active packages yet.
                </p>
                <Link href="/wellness/deep-reset">
                  <Button variant="outline">Explore Deep Reset</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolments.map((enrolment) => {
                  const credits = enrolment.session_credits || {}
                  return (
                    <div key={enrolment.id} className="rounded-lg border border-muted p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">
                            {enrolment.wellness_packages?.name ?? 'Wellness Package'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started {formatDate(enrolment.started_at ?? enrolment.created_at, 'long')}
                          </p>
                        </div>
                        <span
                          className={`text-xs uppercase tracking-wide ${
                            enrolment.status === 'active'
                              ? 'text-green-600'
                              : enrolment.status === 'completed'
                              ? 'text-forest'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {enrolment.status}
                        </span>
                      </div>
                      <div className="mt-4 overflow-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2">Session type</th>
                              <th className="py-2">Included</th>
                              <th className="py-2">Used</th>
                              <th className="py-2">Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(credits).map(([type, entry]) => {
                              const remaining = Math.max(0, entry.included - entry.used)
                              return (
                                <tr key={type} className="border-t">
                                  <td className="py-2 capitalize">{type.replace(/_/g, ' ')}</td>
                                  <td className="py-2">{entry.included}</td>
                                  <td className="py-2">{entry.used}</td>
                                  <td className="py-2">{remaining}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <Link href="/booking">
                        <Button variant="outline" size="sm" className="mt-4">
                          Book remaining sessions
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Your most recent purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here!
                </p>
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at, 'long')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(order.total_amount)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.order_items?.length || 0} item(s)
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="mt-3">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
