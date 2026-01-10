import type { ReminderWithSubscription } from '@/lib/types/reminder'

export interface ReminderDetailsProps {
  reminders: ReminderWithSubscription[]
  onDelete: (reminderId: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ReminderDetails({ reminders, onDelete }: ReminderDetailsProps) {
  if (reminders.length === 0) {
    return null
  }

  return (
    <div className="mt-4 space-y-3">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {reminder.subscription.service_name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  reminder.type === 'cancel'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {reminder.type === 'cancel' ? 'Cancel' : 'Resubscribe'}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(reminder.trigger_date)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(reminder.id)}
            className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
