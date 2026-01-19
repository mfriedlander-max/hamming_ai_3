import { createClient } from '@/lib/supabase/server'
import { RemindersClient } from '@/components/reminders'
import type { ReminderWithSubscription } from '@/lib/types/reminder'
import type { SubscriptionStatus } from '@/components/subscriptions/StatusBadge'

export default async function RemindersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's reminders with subscription details
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select(
      `
      id,
      user_id,
      subscription_id,
      type,
      trigger_date,
      triggered,
      created_at,
      subscription:subscriptions (
        id,
        status,
        service:services (
          name
        )
      )
    `
    )
    .eq('user_id', user?.id)
    .order('trigger_date', { ascending: true })

  if (error) {
    console.error('Error fetching reminders:', error)
  }

  // Transform the response to match ReminderWithSubscription interface
  const transformedReminders: ReminderWithSubscription[] = (reminders || []).map((reminder) => {
    // Supabase returns nested relations - subscription is an object (due to foreign key)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = reminder.subscription as any

    // Handle nested service - could be object or array depending on Supabase response
    let serviceName = 'Unknown Service'
    if (sub?.service) {
      if (Array.isArray(sub.service) && sub.service.length > 0) {
        serviceName = sub.service[0].name
      } else if (sub.service.name) {
        serviceName = sub.service.name
      }
    }

    return {
      id: reminder.id,
      user_id: reminder.user_id,
      subscription_id: reminder.subscription_id,
      type: reminder.type as 'cancel' | 'resubscribe',
      trigger_date: reminder.trigger_date,
      triggered: reminder.triggered,
      created_at: reminder.created_at,
      subscription: {
        id: sub?.id ?? reminder.subscription_id,
        service_name: serviceName,
        status: (sub?.status ?? 'unknown') as SubscriptionStatus,
      },
    }
  })

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Reminders</h1>
        <p className="text-muted-foreground">
          Manage your cancel and resubscribe reminders.
        </p>
      </div>

      <RemindersClient initialReminders={transformedReminders} />
    </div>
  )
}
