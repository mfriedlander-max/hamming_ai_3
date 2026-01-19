import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/subscriptions/DashboardClient'
import type { SubscriptionWithService, Service, BoardColumn } from '@/components/subscriptions/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's profile to get their name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user?.id)
    .single()

  // Fetch user's subscriptions with service data
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select(
      `
      id,
      user_id,
      service_id,
      status,
      monthly_cost,
      created_at,
      board_column,
      service:services (
        id,
        name,
        slug,
        logo_url,
        default_price,
        tmdb_provider_id,
        cancel_url
      )
    `
    )
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Fetch all available services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, slug, logo_url, default_price, tmdb_provider_id, cancel_url')
    .order('name')

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
  }

  if (servicesError) {
    console.error('Error fetching services:', servicesError)
  }

  // Transform the subscriptions data to match our types
  const typedSubscriptions: SubscriptionWithService[] = (subscriptions || []).map((sub) => ({
    id: sub.id,
    user_id: sub.user_id,
    service_id: sub.service_id,
    status: sub.status as 'active' | 'paused',
    monthly_cost: sub.monthly_cost,
    created_at: sub.created_at,
    board_column: (sub.board_column as BoardColumn) || 'active',
    service: sub.service as unknown as Service,
  }))

  const typedServices: Service[] = (services || []).map((service) => ({
    id: service.id,
    name: service.name,
    slug: service.slug,
    logo_url: service.logo_url,
    default_price: service.default_price,
    tmdb_provider_id: service.tmdb_provider_id,
    cancel_url: service.cancel_url,
  }))

  // Calculate total monthly cost
  const totalMonthlyCost = typedSubscriptions
    .filter((sub) => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.monthly_cost, 0)

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col p-6 md:p-8">
      <div className="shrink-0 flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </p>
        </div>
        {typedSubscriptions.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Monthly Spend</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalMonthlyCost.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <DashboardClient
          initialSubscriptions={typedSubscriptions}
          availableServices={typedServices}
        />
      </div>
    </div>
  )
}
