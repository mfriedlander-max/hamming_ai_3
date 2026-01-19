import { CalendarPageClient } from './CalendarPageClient'

export const metadata = {
  title: 'Content Calendar | SubCycle',
  description: 'Your unified hub for streaming subscriptions, recommendations, and savings',
}

export default function CalendarPage() {
  return (
    <div className="p-6 md:p-8">
      <CalendarPageClient />
    </div>
  )
}
