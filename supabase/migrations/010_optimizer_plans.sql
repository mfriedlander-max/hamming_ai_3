-- Phase UX-1: Optimizer Plans Cache
-- Stores generated optimizer plans with input hashing for cache invalidation

CREATE TABLE public.optimizer_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan JSONB NOT NULL,
  inputs_hash TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour'
);

-- Index for quick user lookup
CREATE INDEX idx_optimizer_plans_user_id ON public.optimizer_plans(user_id);

-- Index for cache cleanup (expired plans)
CREATE INDEX idx_optimizer_plans_expires_at ON public.optimizer_plans(expires_at);

-- Enable Row Level Security
ALTER TABLE public.optimizer_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own optimizer plans
CREATE POLICY "Users can view own optimizer plans"
  ON public.optimizer_plans FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own optimizer plans
CREATE POLICY "Users can insert own optimizer plans"
  ON public.optimizer_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own optimizer plans
CREATE POLICY "Users can update own optimizer plans"
  ON public.optimizer_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own optimizer plans
CREATE POLICY "Users can delete own optimizer plans"
  ON public.optimizer_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE public.optimizer_plans IS 'Cached optimizer-v2 plans for each user with hash-based invalidation';
COMMENT ON COLUMN public.optimizer_plans.plan IS 'Full OptimizedPlan JSON including watch_intents, schedule, windows, actions, savings';
COMMENT ON COLUMN public.optimizer_plans.inputs_hash IS 'Hash of optimizer inputs for cache invalidation';
COMMENT ON COLUMN public.optimizer_plans.expires_at IS 'Plans expire after 1 hour and should be regenerated';
