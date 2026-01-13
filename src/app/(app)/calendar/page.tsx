import { ContentCalendar } from '@/components/calendar/ContentCalendar'

export const metadata = {
  title: 'Content Calendar | SubCycle',
  description: 'View upcoming content releases across your streaming services',
}

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <ContentCalendar />
      </div>
    </div>
  )
}
