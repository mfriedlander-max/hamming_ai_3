import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BingeClient } from '@/components/binge/BingeClient'

async function getDefaultWatchSpeed(): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 2 // Default fallback
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('watch_speed')
    .eq('id', user.id)
    .single()

  return profile?.watch_speed || 2
}

export default async function BingePage() {
  const defaultWatchSpeed = await getDefaultWatchSpeed()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Binge Planner</h1>
        <p className="text-gray-600 mt-1">
          Calculate optimal subscribe and cancel dates for binge-watching shows
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8 text-gray-500">Loading...</div>
        }
      >
        <BingeClient defaultWatchSpeed={defaultWatchSpeed} />
      </Suspense>
    </div>
  )
}
