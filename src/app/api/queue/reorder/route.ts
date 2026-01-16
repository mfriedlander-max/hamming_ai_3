import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ReorderItem {
  id: string
  priority: number
}

interface ReorderRequest {
  items: ReorderItem[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as ReorderRequest

  if (!body.items || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Items array required' }, { status: 400 })
  }

  // Update each item's priority
  for (const item of body.items) {
    await supabase
      .from('queue_items')
      .update({ priority: item.priority })
      .eq('id', item.id)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
