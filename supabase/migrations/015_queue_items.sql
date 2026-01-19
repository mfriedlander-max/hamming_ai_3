-- Queue Items table for watch queue functionality
-- Stores user's prioritized content queue

CREATE TABLE IF NOT EXISTS public.queue_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv')),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  poster_path TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  priority INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('watchlist', 'friend_share', 'taste_match', 'binge_plan', 'manual')),
  deadline DATE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, tmdb_id, content_type)
);

-- RLS Policies
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue items" ON public.queue_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items" ON public.queue_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue items" ON public.queue_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue items" ON public.queue_items
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_queue_items_user ON public.queue_items(user_id);
CREATE INDEX idx_queue_items_priority ON public.queue_items(user_id, priority);
CREATE INDEX idx_queue_items_service ON public.queue_items(service_id);
