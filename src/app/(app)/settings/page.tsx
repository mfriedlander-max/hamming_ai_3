import { createClient } from '@/lib/supabase/server'
import { TasteProfileEditor } from '@/components/settings/TasteProfileEditor'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's taste profile
  const { data: tasteProfile } = await supabase
    .from('taste_profiles')
    .select('genres, favorite_shows')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your taste preferences to get better recommendations.
        </p>
      </div>

      <div className="max-w-2xl">
        <TasteProfileEditor
          initialGenres={tasteProfile?.genres || []}
          initialFavoriteShows={tasteProfile?.favorite_shows || []}
        />
      </div>
    </div>
  )
}
