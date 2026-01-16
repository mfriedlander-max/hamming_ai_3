import { createClient } from '@/lib/supabase/server'
import { RecommendationsClient } from '@/components/recommendations'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's active subscriptions with service data for pricing
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(
      `
      id,
      service_id,
      monthly_cost,
      service:services (
        id,
        name
      )
    `
    )
    .eq('user_id', user?.id)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching subscriptions:', error)
  }

  // Transform to service info for the client component
  const services = (subscriptions || []).map((sub) => {
    // Supabase returns service as array when using nested select
    const serviceData = sub.service as unknown
    const service = Array.isArray(serviceData) ? serviceData[0] : serviceData as { id: string; name: string } | null
    return {
      id: sub.id, // Use subscription ID, not service ID
      name: service?.name || 'Unknown Service',
      monthly_cost: sub.monthly_cost,
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
        <p className="text-gray-600">
          Smart suggestions to optimize your streaming subscriptions based on upcoming content.
        </p>
      </div>

      <RecommendationsClient initialServices={services} />
    </div>
  )
}
