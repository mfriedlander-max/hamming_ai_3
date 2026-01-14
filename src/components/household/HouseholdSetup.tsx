'use client'

import { useState } from 'react'
import { Users, UserPlus, Loader2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface HouseholdSetupProps {
  onCreate: (name: string) => Promise<void>
  onJoin: (inviteCode: string) => Promise<void>
}

export function HouseholdSetup({ onCreate, onJoin }: HouseholdSetupProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Household name is required')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await onCreate(name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create household')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Invite code is required')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await onJoin(inviteCode.trim().toUpperCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join household')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <Home className="h-6 w-6 text-gray-600" />
        </div>
        <CardTitle>Set Up Household</CardTitle>
        <CardDescription>
          Create a new household or join an existing one to share subscriptions with family.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'create' | 'join'); setError(null) }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Users className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="join">
              <UserPlus className="h-4 w-4 mr-2" />
              Join
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Household name (e.g., Smith Family)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Household'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Invite code (e.g., ABCD1234)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={8}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Household'
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
