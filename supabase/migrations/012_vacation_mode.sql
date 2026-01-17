-- Migration 012: Vacation Mode and Edge Case Handling
-- Adds vacation mode columns to profiles, activity tracking to behavior patterns,
-- and price history tracking for services.

-- Add vacation mode columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vacation_start_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vacation_return_date DATE;

-- Add last_activity tracking columns to user_behavior_patterns
ALTER TABLE user_behavior_patterns ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMPTZ;
ALTER TABLE user_behavior_patterns ADD COLUMN IF NOT EXISTS last_queue_interaction TIMESTAMPTZ;
ALTER TABLE user_behavior_patterns ADD COLUMN IF NOT EXISTS items_completed_count INTEGER DEFAULT 0;

-- Create price history table for tracking service price changes
CREATE TABLE IF NOT EXISTS service_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_price_history_service ON service_price_history(service_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON service_price_history(detected_at);

-- RLS policies for price history (public read for authenticated users)
ALTER TABLE service_price_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'service_price_history' AND policyname = 'Authenticated users can view price history'
  ) THEN
    CREATE POLICY "Authenticated users can view price history"
      ON service_price_history FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
