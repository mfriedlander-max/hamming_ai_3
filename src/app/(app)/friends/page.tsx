import { SocialClient } from '@/components/social/SocialClient'

export const metadata = {
  title: 'Friends | SubCycle',
  description: 'Connect with friends and share subscription activity',
}

export default function FriendsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Social</h1>
          <p className="text-muted-foreground mt-1">
            Connect with friends, share activity, and collaborate on watchlists
          </p>
        </div>
        <SocialClient />
      </div>
    </div>
  )
}
