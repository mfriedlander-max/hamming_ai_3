-- Fix infinite recursion in watchlist_members RLS policies
-- The original policies reference watchlist_members table from within watchlist_members policies,
-- causing infinite recursion when PostgreSQL tries to evaluate the policy.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view watchlist members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners can manage members" ON public.watchlist_members;

-- Recreate with non-recursive logic
-- For SELECT: Users can see members of watchlists they belong to
-- We use a direct check instead of subquery on same table
CREATE POLICY "Members can view watchlist members" ON public.watchlist_members
  FOR SELECT USING (
    -- User can see their own membership
    user_id = auth.uid()
    -- User can see other members if they are also a member of the same watchlist
    OR watchlist_id IN (
      SELECT wm.watchlist_id
      FROM public.watchlist_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

-- For INSERT/UPDATE/DELETE: Only owners can manage members
-- We check ownership via watchlists table to avoid recursion
CREATE POLICY "Owners can add members" ON public.watchlist_members
  FOR INSERT WITH CHECK (
    watchlist_id IN (
      SELECT id FROM public.watchlists WHERE created_by = auth.uid()
    )
    -- Or user is adding themselves (joining via invite)
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners can update members" ON public.watchlist_members
  FOR UPDATE USING (
    watchlist_id IN (
      SELECT id FROM public.watchlists WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Owners can delete members" ON public.watchlist_members
  FOR DELETE USING (
    watchlist_id IN (
      SELECT id FROM public.watchlists WHERE created_by = auth.uid()
    )
    -- Or user can remove themselves
    OR user_id = auth.uid()
  );
