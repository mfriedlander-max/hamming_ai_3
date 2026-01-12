import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

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

  // Fetch user's connected emails
  const { data: connectedEmails } = await supabase
    .from('user_emails')
    .select('id, email, provider, created_at')
    .eq('user_id', user?.id)

  return (
    <SettingsClient
      initialGenres={tasteProfile?.genres || []}
      initialFavoriteShows={tasteProfile?.favorite_shows || []}
      initialConnectedEmails={connectedEmails || []}
    />
  )
}
