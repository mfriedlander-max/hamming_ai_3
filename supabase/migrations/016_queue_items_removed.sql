-- Add removed column to track user's removed items
-- This allows us to filter out optimizer suggestions the user doesn't want

ALTER TABLE public.queue_items ADD COLUMN IF NOT EXISTS removed BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for efficiently querying non-removed items
CREATE INDEX IF NOT EXISTS idx_queue_items_removed ON public.queue_items(user_id, removed);
