-- Phase 13b: Social Features Migration
-- Friendships, Activity Feed, and Shared Watchlists

-- Friendships table (bidirectional)
CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Activity feed for subscription changes
CREATE TABLE public.activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('subscribed', 'paused', 'resumed', 'cancelled')),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared watchlists
CREATE TABLE public.watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist members (who can see/edit)
CREATE TABLE public.watchlist_members (
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (watchlist_id, user_id)
);

-- Watchlist items
CREATE TABLE public.watchlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(watchlist_id, tmdb_id, content_type)
);

-- RLS Policies
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "Users can send friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can manage own friendships" ON public.friendships
  FOR UPDATE USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() IN (requester_id, addressee_id));

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friends can view activity" ON public.activity_feed
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT CASE
        WHEN requester_id = auth.uid() THEN addressee_id
        ELSE requester_id
      END
      FROM public.friendships
      WHERE status = 'accepted'
        AND auth.uid() IN (requester_id, addressee_id)
    )
  );
CREATE POLICY "Users can create own activity" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view watchlists" ON public.watchlists
  FOR SELECT USING (
    id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create watchlists" ON public.watchlists
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update watchlists" ON public.watchlists
  FOR UPDATE USING (
    id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid() AND role = 'owner')
  );
CREATE POLICY "Owners can delete watchlists" ON public.watchlists
  FOR DELETE USING (
    id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid() AND role = 'owner')
  );

ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view watchlist members" ON public.watchlist_members
  FOR SELECT USING (
    watchlist_id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Owners can manage members" ON public.watchlist_members
  FOR ALL USING (
    watchlist_id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid() AND role = 'owner')
  );

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view items" ON public.watchlist_items
  FOR SELECT USING (
    watchlist_id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Editors can manage items" ON public.watchlist_items
  FOR ALL USING (
    watchlist_id IN (SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

-- Indexes
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX idx_watchlist_members_user ON public.watchlist_members(user_id);
CREATE INDEX idx_watchlist_items_watchlist ON public.watchlist_items(watchlist_id);
