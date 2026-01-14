-- Phase 13a: Household Mode
-- Multi-user household support for sharing subscriptions and combining taste profiles

-- Households table
CREATE TABLE public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household members junction table
CREATE TABLE public.household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  display_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Add household reference to subscriptions (shared pool)
ALTER TABLE public.subscriptions
ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE SET NULL;

-- RLS Policies for households
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their household" ON public.households
  FOR SELECT USING (
    id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update household" ON public.households
  FOR UPDATE USING (
    id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete household" ON public.households
  FOR DELETE USING (
    id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- RLS Policies for household_members
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view household members" ON public.household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON public.household_members
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Users can join via invite" ON public.household_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave" ON public.household_members
  FOR DELETE USING (auth.uid() = user_id);

-- Update subscriptions RLS to allow household members
CREATE POLICY "Household members can view shared subscriptions" ON public.subscriptions
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX idx_household_members_user ON public.household_members(user_id);
CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_households_invite_code ON public.households(invite_code);
CREATE INDEX idx_subscriptions_household ON public.subscriptions(household_id);
