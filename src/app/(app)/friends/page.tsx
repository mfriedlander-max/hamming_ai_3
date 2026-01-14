import { SocialClient } from '@/components/social/SocialClient'

export const metadata = {
  title: 'Friends | SubCycle',
  description: 'Connect with friends and share subscription activity',
}

export default function FriendsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social</h1>
        <p className="text-gray-500 mt-1">
          Connect with friends, share activity, and collaborate on watchlists
        </p>
      </div>
      <SocialClient />
    </div>
  )
}
