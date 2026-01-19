-- Migration 013: Fix content table schema
-- The original content table was designed for global content caching,
-- but the sync code expects per-user, per-service content with match scores.

-- Drop old content table and recreate with correct schema
DROP TABLE IF EXISTS public.content;

-- Recreate content table with user-specific content caching
CREATE TABLE public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  release_date DATE,
  genres TEXT[] DEFAULT '{}',
  poster_url TEXT,
  match_score INTEGER DEFAULT 0,
  match_reason TEXT,
  cached_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Same content can exist for different users/services
  UNIQUE(user_id, service_id, tmdb_id)
);

-- RLS policies for user-specific content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content"
  ON public.content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content"
  ON public.content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
  ON public.content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON public.content FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_content_user_service ON public.content(user_id, service_id);
CREATE INDEX idx_content_cached_until ON public.content(cached_until);
CREATE INDEX idx_content_release_date ON public.content(release_date);
