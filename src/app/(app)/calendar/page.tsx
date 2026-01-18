import { CalendarPageClient } from './CalendarPageClient'

export const metadata = {
  title: 'Content Calendar | SubCycle',
  description: 'Your unified hub for streaming subscriptions, recommendations, and savings',
}

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-auto bg-muted">
      <div className="max-w-6xl mx-auto p-6">
        <CalendarPageClient />
      </div>
    </div>
  )
}
