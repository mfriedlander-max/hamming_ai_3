-- Phase UX-2: Auto-Pilot System
-- Tables for automatic subscription management

-- Add timezone to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Auto-actions tracking table
CREATE TABLE public.auto_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('subscribe', 'cancel', 'pause', 'resume', 'set_reminder')),
  service_id UUID REFERENCES public.services(id),
  scheduled_date DATE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
  reason TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_auto_actions_user_id ON public.auto_actions(user_id);
CREATE INDEX idx_auto_actions_scheduled_date ON public.auto_actions(scheduled_date);
CREATE INDEX idx_auto_actions_status ON public.auto_actions(status);

-- RLS
ALTER TABLE public.auto_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auto_actions"
  ON public.auto_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto_actions"
  ON public.auto_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto_actions"
  ON public.auto_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- User behavior patterns table
CREATE TABLE public.user_behavior_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  avg_watch_hours_per_week FLOAT DEFAULT 10,
  preferred_action_time TIME DEFAULT '09:00',
  missed_deadline_count INTEGER DEFAULT 0,
  auto_actions_accepted INTEGER DEFAULT 0,
  auto_actions_rejected INTEGER DEFAULT 0,
  timezone TEXT DEFAULT 'America/New_York',
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_behavior_patterns_user_id ON public.user_behavior_patterns(user_id);

-- RLS
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior_patterns"
  ON public.user_behavior_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own behavior_patterns"
  ON public.user_behavior_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own behavior_patterns"
  ON public.user_behavior_patterns FOR UPDATE
  USING (auth.uid() = user_id);
