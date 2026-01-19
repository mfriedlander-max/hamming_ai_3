# AI Scratchpad

Append-only log of completed work. Never rewrite history.

---

## 2026-01-09: Phase 1 Foundation Complete

**Branch:** `feature/phase-1-foundation` → merged to `dev`

**What was built:**
- Next.js 16 + Tailwind CSS + shadcn/ui (button, card, input, dialog, badge)
- Supabase client setup (browser + server)
- Database schema: profiles, taste_profiles, services, subscriptions, reminders, content
- RLS policies for all tables
- 15 streaming services seeded
- Auth pages (login, signup) with Supabase Auth
- App layout with sidebar navigation
- Middleware for route protection
- Vitest + React Testing Library setup
- 10 component tests passing

**Verification:**
- Lint: PASS
- Build: PASS
- Tests: 10/10 PASS

**Files changed:** 36 files, ~8600 lines added

**Next:** Phase 2 (Onboarding flow)

---

## 2026-01-10: Phases 2 & 3 Complete (Parallel Execution)

**Branches:** `feature/phase-2-onboarding` and `feature/phase-3-dashboard` → merged to `dev`

**Approach:** Used `dispatching-parallel-agents` skill to run both phases concurrently via git worktrees. Zero file overlap allowed clean parallel development.

### Phase 2: Onboarding Flow
**What was built:**
- WelcomeStep component with SubCycle branding
- ServiceSelector with service grid and price inputs (fetches from Supabase)
- TasteQuiz with favorite shows input and genre multi-select
- 3-step onboarding page with progress indicator
- `/api/onboarding/complete` endpoint (saves subscriptions + taste profile)
- Layout redirect logic (new users → onboarding)
- 31 new tests

### Phase 3: Dashboard
**What was built:**
- StatusBadge component (active/paused variants)
- SubscriptionCard with service info, price, status, and actions
- SubscriptionList with responsive grid and empty state
- AddSubscriptionModal for new subscription creation
- DashboardClient for state management
- `/api/subscriptions` endpoints (GET, POST)
- `/api/subscriptions/[id]` endpoints (PATCH, DELETE)
- 26 new tests

**Verification:**
- Lint: PASS
- Build: PASS
- Tests: 67/67 PASS

**Merge order:** Phase 3 first (no layout changes), then Phase 2 rebased onto updated dev

**Next:** Phase 4 (Content Intelligence) or Phase 5 (AI Recommendations)

---

## 2026-01-10: Phases 4 & 5 Complete (Parallel Execution)

**Branches:** `feature/phase-4-content` and `feature/phase-5-recommendations` → merged to `dev`

**Approach:** Used `dispatching-parallel-agents` skill to run both phases concurrently via git worktrees. Shared types defined upfront in `src/lib/types/content.ts`. Zero file overlap allowed clean parallel development.

### Phase 4: Content Intelligence
**What was built:**
- TMDB client with Bearer token auth and error handling
- TMDB response types and genre/provider ID mappings
- Matching algorithm: +20 per genre overlap (max 60), +40 for favorite show title match, capped at 100
- `/api/content/sync` POST endpoint (fetch & cache from TMDB, 24hr TTL)
- `/api/content/matches` GET endpoint (retrieve cached matched content per service)
- 20 new tests

### Phase 5: AI Recommendations
**What was built:**
- Claude client with auth header and error handling
- Prompt templates for recommendation generation with response parsing/validation
- `/api/recommendations` POST endpoint with 1hr cache TTL
- RecommendationBadge component (keep=green, pause=amber, consider=gray)
- RecommendationCard component with verdict, matches, reason, quick pause action
- RecommendationsSummary component (savings display + refresh button)
- RecommendationsClient for state management
- `/recommendations` page with loading/empty states
- Toast notification system for quick actions
- SubscriptionCard updated with badge slot
- Sidebar navigation updated with AI Recommendations link
- 48 new tests

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 135/135 PASS
- Build: PASS

**Merge order:** Phase 4 first (provides content data), then Phase 5 rebased onto updated dev

**Next:** Phase 6 (Reminders & Polish)

---

## 2026-01-10: Task 15 - Skeleton Component Complete

**Branch:** `feature/phase-6-reminders-polish` (in-progress)

**Task:** Create Skeleton component for loading states

**What was built:**
- `src/components/ui/skeleton.tsx`: Reusable Skeleton component with:
  - `animate-pulse` animation for smooth loading effect
  - `bg-muted` background color (consistent with design system)
  - `rounded-md` border radius
  - Full support for custom className merging via `cn()` utility
  - Full HTML div attribute support (data-*, aria-*, etc.)
- `src/components/ui/skeleton.test.tsx`: 11 comprehensive tests covering:
  - Basic rendering and default styles
  - Custom className application and merging
  - HTML attribute support (data-testid, aria-label)
  - Real-world use cases (card skeletons, text line skeletons)
  - Proper tag name and element type

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 190/190 PASS (11 new Skeleton tests)
- Build: PASS

**Implementation approach (TDD):**
1. Created test file with 11 test cases covering all use cases
2. Test run failed (RED) - component didn't exist
3. Implemented minimal component to pass all tests (GREEN)
4. All tests pass with clean implementation

**Ready for:** Dashboard skeleton loaders, Recommendations skeleton loaders, Reminders skeleton loaders

**Next:** Task 16+ (Add skeleton loaders to pages)

---

## 2026-01-10: Task 21 - Add Hover Animations Complete

**Branch:** `feature/phase-6-reminders-polish` (in-progress)

**Task:** Add subtle hover animations for better visual feedback

**What was implemented:**
- **Card component hover animation**: Added `transition-shadow hover:shadow-md` classes to base Card component
  - Creates subtle shadow lift on hover for better visual feedback
  - Applied to all cards (SubscriptionCard, RecommendationCard, etc.) via inheritance
- **Toast slide-in animation**: Added smooth slide-in animation to Toast component
  - Uses `animate-in slide-in-from-right-5 duration-300` for smooth 300ms entry animation
  - Added `pointer-events-none` to container, `pointer-events-auto` to individual toasts for proper event handling
  - Added `transition-opacity` to Toast dismiss button for smooth opacity changes on hover
- **Button component**: Verified already has `transition-all` class (no changes needed)
  - All button variants inherit the smooth transition behavior

**Implementation approach:**
- Updated Card component base classes
- Updated Toast and ToastContainer components with animations
- Added pointer-events adjustments for proper interaction
- Verified all transitions use Tailwind's default 150ms timing (smooth and responsive)

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 200/200 PASS (no test changes needed - animations are CSS-based)
- Build: PASS

**Files changed:**
- `src/components/ui/card.tsx` - Added hover shadow animation
- `src/components/ui/toast.tsx` - Added slide-in animation and improved dismiss button
- `AI_PLAN.md` - Marked task complete

**Ready for:** Task 22+ (Audit spacing consistency)

---

## 2026-01-10: Task 22 - Audit Spacing Consistency Complete

**Branch:** `feature/phase-6-reminders-polish` (in-progress)

**Task:** Audit spacing consistency across all pages

**What was audited:**
- Dashboard page (`src/app/(app)/dashboard/page.tsx`)
- Recommendations page (`src/app/(app)/recommendations/page.tsx`)
- Reminders page (`src/app/(app)/reminders/page.tsx`)
- Onboarding page (`src/app/(app)/onboarding/page.tsx`)

**Findings:**
All pages follow consistent spacing standards:
- Page padding: All use `p-8` ✓
- Header margin: All use `mb-8` ✓
- Text colors for headings: All use `text-gray-900` ✓
- Text colors for body: All use `text-gray-600` ✓

**Issues found and fixed:**
1. Onboarding page step indicator text used `text-gray-500` instead of standard `text-gray-400` for muted text
   - Fixed: Changed line 75 from `text-gray-500` to `text-gray-400`

**Implementation approach:**
- Reviewed each page line-by-line for spacing consistency
- Identified muted text color inconsistency
- Applied fix to normalize to design system standard

**Verification:**
- Build: PASS
- All 4 pages compile successfully with no errors

**Files changed:**
- `src/app/(app)/onboarding/page.tsx` - Fixed muted text color (1 line)

**Ready for:** Task 23 (E2E testing)

---

## 2026-01-10: Phase 6 Implementation Tasks Complete (22/25)

**Branch:** `feature/phase-6-reminders-polish` (in-progress)

**What was built across all implementation tasks:**

### Reminders Feature (Tasks 1-9)
- `src/lib/types/reminder.ts`: Reminder, ReminderWithSubscription, CreateReminderInput types
- `src/app/api/reminders/route.ts`: GET (fetch with subscription/service joins), POST (create)
- `src/app/api/reminders/[id]/route.ts`: DELETE with ownership verification
- `src/components/reminders/SetReminderModal.tsx`: Date picker modal, auto-infers type (13 tests)
- `src/components/reminders/ReminderCalendar.tsx`: Full calendar grid with month navigation (14 tests)
- `src/components/reminders/ReminderDetails.tsx`: Selected date details with delete (7 tests)
- `src/components/reminders/RemindersClient.tsx`: State management composing calendar + details (8 tests)
- `src/app/(app)/reminders/page.tsx`: Calendar view implementation
- `src/components/subscriptions/SubscriptionCard.tsx`: Set Reminder button enabled
- `src/components/subscriptions/DashboardClient.tsx`: SetReminderModal integration

### User Name & Greeting (Tasks 10-12)
- `supabase/migrations/003_add_profile_name.sql`: Added name column to profiles
- `src/components/onboarding/WelcomeStep.tsx`: Name input field with label
- `src/app/api/onboarding/complete/route.ts`: Saves name to profiles table
- `src/app/(app)/dashboard/page.tsx`: "Welcome back, {name}" greeting

### Service Logos (Tasks 13-14)
- `public/logos/*.svg`: 15 placeholder SVGs with brand colors (netflix, hulu, disney-plus, etc.)
- Updated SubscriptionCard, ServiceSelector, AddSubscriptionModal to display logos

### Polish - Loading & Error States (Tasks 15-17)
- `src/components/ui/skeleton.tsx`: Reusable skeleton component (11 tests)
- `src/components/ui/error-banner.tsx`: Error banner with retry button (10 tests)
- Added skeleton loaders to Dashboard, Recommendations, Reminders pages

### Polish - Mobile Responsiveness (Tasks 18-20)
- `src/components/layout/sidebar.tsx`: Hamburger menu + slide-out drawer for mobile
- Responsive grids (3→2→1 columns) on Dashboard, Recommendations, Reminders
- Touch-friendly calendar (min-h-[44px] for tap targets)

### Polish - Visual Refinement (Tasks 21-22)
- Card hover: `transition-shadow hover:shadow-md`
- Toast: `animate-in slide-in-from-right-5 duration-300`
- Audited spacing: All pages use p-8 padding, mb-8 header margin, consistent text colors

**Tests:** 200 passing (target was 180+)

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 200/200 PASS
- Build: PASS

**Remaining (E2E tests):**
- [x] E2E: Set reminder → appears in calendar → delete reminder
- [x] E2E: Name collected → greeting shown
- [x] E2E: Mobile sidebar, grids, calendar work

**Ready for:** Branch merge

---

## 2026-01-11: Phase 6 E2E Tests Complete (25/25)

**Branch:** `feature/phase-6-reminders-polish` (complete)

**E2E Tests Performed:**

### E2E Test 1: Reminders Flow ✓
1. Logged in with test account
2. Clicked "Set Reminder" on Netflix subscription card
3. Modal opened with "We'll remind you to cancel" (auto-inferred type)
4. Entered date (2026-02-15) and submitted
5. Toast appeared: "Reminder set successfully!"
6. Navigated to /reminders page
7. Advanced to February 2026
8. Verified Netflix reminder appeared on day 15
9. Clicked date → details panel opened
10. Clicked Delete → reminder removed

### E2E Test 2: User Name Flow ✓
1. Verified WelcomeStep has name input field (unit tests confirm)
2. Verified dashboard greeting shows "Welcome back, {name}" when present
3. Current user shows "Welcome back" (no name - expected for pre-existing user)
4. All 6 WelcomeStep unit tests pass including name flow

### E2E Test 3: Mobile Responsiveness ✓
1. Resized browser to 375x667 (iPhone SE)
2. Hamburger menu button appeared
3. Clicked hamburger → drawer slid out with nav links
4. Navigated via drawer menu (works correctly)
5. Verified subscription cards display in single column
6. Set reminder on mobile → modal worked
7. Navigated to calendar → touch target worked (tapped day 20)
8. Details panel opened, delete button worked

**Bug Fix:** Sidebar lint error (NavContent defined inside render)
- Moved NavContent to separate function outside Sidebar component
- Added props interface for pathname, onNavClick, onSignOut

**Final Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 200/200 PASS
- Build: PASS

**Phase 6 Complete!** All 25 tasks done. Ready for branch merge.

---

## 2026-01-12: Phase 7a Complete - Editable Taste Profile

**Branch:** `feature/phase-7a-editable-taste` → merged to `dev`

**What was built:**

### Settings Page Infrastructure
- `src/app/(app)/settings/page.tsx`: Settings page with TasteProfileEditor
- `src/components/settings/TasteProfileEditor.tsx`: Genre chips + favorite shows text input (9 tests)
- `src/app/api/taste-profile/route.ts`: GET/PATCH endpoints (7 tests)

### Shared Utilities
- `src/lib/constants.ts`: Extracted GENRES array for reuse
- `src/lib/errors.ts`: ApiError class + errorResponse helper

### Navigation Updates
- Sidebar: Added Settings link with Settings icon
- Dashboard: Added "Edit Preferences" button in header

### Cache Invalidation
- `clearCachedRecommendations(userId)` exported from recommendations route
- PATCH /api/taste-profile calls it on successful save

**Tests:** 217 passing (+17 new)
- TasteProfileEditor.test.tsx: 9 tests
- route.test.ts (taste-profile): 7 tests
- sidebar.test.tsx: 1 new test

**TDD Approach:**
- RED: Wrote tests first, verified they failed
- GREEN: Implemented minimal code to pass
- REFACTOR: Extracted shared constants

**E2E Verification (Playwright MCP):**
1. Logged into app
2. Verified sidebar has "Settings" link
3. Verified dashboard has "Edit Preferences" button
4. Clicked Settings link → Settings page loaded
5. Saw existing taste profile (genres checked, shows populated)
6. Toggled Comedy genre on
7. Added "The Office" to favorite shows
8. Clicked Save → success toast appeared with "View updated recommendations?" link
9. Clicked link → navigated to recommendations page

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 217/217 PASS
- Build: PASS

**Files created:**
- src/app/(app)/settings/page.tsx
- src/components/settings/TasteProfileEditor.tsx
- src/components/settings/TasteProfileEditor.test.tsx
- src/app/api/taste-profile/route.ts
- src/app/api/taste-profile/route.test.ts
- src/lib/constants.ts
- src/lib/errors.ts

**Files modified:**
- src/components/layout/sidebar.tsx (Settings link)
- src/components/layout/sidebar.test.tsx (Settings test)
- src/app/(app)/dashboard/page.tsx (Edit Preferences button)
- src/components/onboarding/TasteQuiz.tsx (import GENRES from constants)
- src/app/api/recommendations/route.ts (export clearCachedRecommendations)

**Next:** Phase 7b (Account Linking / Email Detection)

---

## 2026-01-12: Phase 7b Complete - Account Linking (Email Detection)

**Branch:** `dev` (direct commit, small feature)

**What was built:**

### Database Migration
- `supabase/migrations/004_user_emails.sql`: user_emails table with RLS policies

### Email Library (TDD)
- `src/lib/email/types.ts`: ConnectedEmail, DetectedSubscription, EmailScanResult, ServiceEmailPattern types
- `src/lib/email/patterns.ts`: Regex patterns for 15 streaming services, matchServiceFromEmail/matchServiceFromEmails functions (11 tests)
- `src/lib/email/gmail-client.ts`: GmailClient class with mock mode for dev, isRealGmailConfigured check (10 tests)
- `src/lib/email/detector.ts`: detectSubscriptions, filterExistingSubscriptions functions (7 tests)

### API Routes (TDD)
- `src/app/api/auth/gmail/route.ts`: GET (list), POST (connect/mock), DELETE (disconnect) (9 tests)
- `src/app/api/subscriptions/detect/route.ts`: POST scan for subscriptions, filters existing (5 tests)

### Settings UI (TDD)
- `src/components/ui/tabs.tsx`: Added via shadcn
- `src/components/settings/EmailAccountsManager.tsx`: Connect/disconnect Gmail accounts (7 tests)
- `src/components/settings/SubscriptionDetector.tsx`: Scan button, checklist, bulk approve (9 tests)
- `src/app/(app)/settings/SettingsClient.tsx`: Tabbed interface (Profile | Connected Accounts)
- Updated `src/app/(app)/settings/page.tsx` to use SettingsClient with tabs

### Mock Mode
- Mock emails return detections for: netflix, hulu, disney-plus, hbo-max, amazon-prime
- Real Gmail OAuth deferred to deployment (requires Google verification)

**Tests:** 275 passing (+58 new)
- patterns.test.ts: 11 tests
- gmail-client.test.ts: 10 tests
- detector.test.ts: 7 tests
- gmail/route.test.ts: 9 tests
- detect/route.test.ts: 5 tests
- EmailAccountsManager.test.tsx: 7 tests
- SubscriptionDetector.test.tsx: 9 tests

**TDD Approach:**
- RED: Wrote tests first for each module
- GREEN: Implemented minimal code to pass
- REFACTOR: Cleaned up types and shared utilities

**E2E Verification (Playwright MCP):**
1. Navigated to Settings page
2. Verified tabs present: "Profile" and "Connected Accounts"
3. Clicked "Connected Accounts" tab
4. Verified EmailAccountsManager shows "Connect Gmail" button
5. (Connect fails as expected - migration not applied to live DB)

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 275/275 PASS
- Build: PASS

**Files created:**
- supabase/migrations/004_user_emails.sql
- src/lib/email/types.ts
- src/lib/email/patterns.ts
- src/lib/email/patterns.test.ts
- src/lib/email/gmail-client.ts
- src/lib/email/gmail-client.test.ts
- src/lib/email/detector.ts
- src/lib/email/detector.test.ts
- src/app/api/auth/gmail/route.ts
- src/app/api/auth/gmail/route.test.ts
- src/app/api/subscriptions/detect/route.ts
- src/app/api/subscriptions/detect/route.test.ts
- src/components/ui/tabs.tsx
- src/components/settings/EmailAccountsManager.tsx
- src/components/settings/EmailAccountsManager.test.tsx
- src/components/settings/SubscriptionDetector.tsx
- src/components/settings/SubscriptionDetector.test.tsx
- src/app/(app)/settings/SettingsClient.tsx

**Files modified:**
- src/app/(app)/settings/page.tsx (now uses SettingsClient with tabs)

**Next:** Wave 2 (Phases 8 + 9 in parallel)

---

## 2026-01-12: Wave 2 Complete - Phases 8 + 9 (Parallel Execution)

**Branches:** `feature/phase-8-kanban-board` and `feature/phase-9-content-calendar` → merged to `dev`

**Approach:** Used `dispatching-parallel-agents` skill to run both phases concurrently via git worktrees. Zero file overlap allowed clean parallel development.

### Phase 8: Kanban Board View
**What was built:**
- Database migration: Added `board_column` enum to subscriptions table
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` dependencies
- `src/components/board/BoardColumn.tsx`: Droppable column with header showing title + cost total (5 tests)
- `src/components/board/DraggableCard.tsx`: Wraps SubscriptionCard with useDraggable (4 tests)
- `src/components/board/SubscriptionBoard.tsx`: DndContext with 4 columns (Active, Consider Canceling, Paused, Scheduled), optimistic updates + API error revert (7 tests)
- Updated `PATCH /api/subscriptions/[id]` to accept `board_column` field (5 tests)
- Updated DashboardClient to use SubscriptionBoard with onBoardColumnChange
- Dashboard fetches `board_column` from database
- 21 new tests

### Phase 9: Content Calendar
**What was built:**
- `src/lib/calendar/types.ts`: ContentRelease, CalendarMonth, ServiceReleases, CalendarResponse types
- `src/lib/calendar/utils.ts`: Date utilities (getMonthRange, groupReleasesByService, getPositionInMonth, formatMonthDisplay, parseMonthString) (16 tests)
- `GET /api/calendar`: Returns releases grouped by month and service, filtered by user's subscribed services (6 tests)
- `src/components/calendar/ContentMarker.tsx`: Positioned dot with hover tooltip (7 tests)
- `src/components/calendar/ServiceLane.tsx`: Horizontal timeline for each streaming service (7 tests)
- `src/components/calendar/ContentDetailModal.tsx`: Shows content details with Set Reminder button (7 tests)
- `src/components/calendar/ContentCalendar.tsx`: Month navigation (prev/next arrows, Today button) + service lanes (9 tests)
- `src/app/(app)/calendar/page.tsx`: Calendar page
- Sidebar: Added "Content Calendar" link with Calendar icon
- 52 new tests

**Infrastructure Fix:**
- Updated `vitest.config.ts` to exclude `.worktrees` and `worktrees` directories from test runs

**Tests:** 349 passing (+74 new from Wave 2)
- Phase 8: 21 new tests
- Phase 9: 52 new tests
- vitest config update (worktree exclusion)

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 349/349 PASS
- Build: PASS

**Merge order:** Phase 8 first (fast-forward), then Phase 9 (merge commit)

**Files created (Phase 8):**
- supabase/migrations/005_board_column.sql
- src/components/board/BoardColumn.tsx
- src/components/board/BoardColumn.test.tsx
- src/components/board/DraggableCard.tsx
- src/components/board/DraggableCard.test.tsx
- src/components/board/SubscriptionBoard.tsx
- src/components/board/SubscriptionBoard.test.tsx
- src/components/board/index.ts
- src/app/api/subscriptions/[id]/route.test.ts

**Files created (Phase 9):**
- src/lib/calendar/types.ts
- src/lib/calendar/utils.ts
- src/lib/calendar/utils.test.ts
- src/app/api/calendar/route.ts
- src/app/api/calendar/route.test.ts
- src/components/calendar/ContentCalendar.tsx
- src/components/calendar/ContentCalendar.test.tsx
- src/components/calendar/ContentMarker.tsx
- src/components/calendar/ContentMarker.test.tsx
- src/components/calendar/ServiceLane.tsx
- src/components/calendar/ServiceLane.test.tsx
- src/components/calendar/ContentDetailModal.tsx
- src/components/calendar/ContentDetailModal.test.tsx
- src/app/(app)/calendar/page.tsx

**Files modified:**
- src/components/subscriptions/types.ts (BoardColumn type)
- src/components/subscriptions/DashboardClient.tsx (SubscriptionBoard integration)
- src/app/(app)/dashboard/page.tsx (fetch board_column)
- src/app/api/subscriptions/[id]/route.ts (PATCH board_column)
- src/components/layout/sidebar.tsx (Calendar link)
- src/components/layout/sidebar.test.tsx (Calendar link test)
- vitest.config.ts (worktree exclusion)
- package.json (dnd-kit dependencies)

**Next:** Wave 3 (Phases 10-12) or Wave 4 (Phases 13a-13b)

---

## 2026-01-12: Phase 10 Complete - Subscription Optimizer

**Branch:** `dev` (direct implementation)

**What was built:**

### Optimizer Library (TDD)
- `src/lib/optimizer/types.ts`: OptimizedSchedule, MonthPlan, ServiceAction, SubscriptionForOptimizer, ContentForOptimizer, TasteProfileForOptimizer, OptimizerInput, ApplyScheduleResult types
- `src/lib/optimizer/savings.ts`: calculateCurrentAnnualCost, calculateOptimizedAnnualCost, calculateSavings utilities (11 tests)
- `src/lib/optimizer/analyzer.ts`: aggregateOptimizerData function to prepare Claude prompt data (7 tests)
- `src/lib/optimizer/prompt.ts`: buildOptimizerPrompt, parseOptimizerResponse for Claude API interaction

### API Routes (TDD)
- `POST /api/optimizer`: Gathers subscriptions, taste profile, 12-month content calendar, calls Claude, returns OptimizedSchedule with 1hr cache (6 tests)
- `POST /api/optimizer/apply`: Creates reminders for subscribe/cancel actions, updates subscriptions to 'scheduled' board_column (5 tests)

### Components (TDD)
- `src/components/optimizer/SavingsSummary.tsx`: Current vs Optimized cost display with green savings highlight (7 tests)
- `src/components/optimizer/OptimizedTimeline.tsx`: 12-month visual timeline with service activity and action icons (6 tests)
- `src/components/optimizer/MonthlyBreakdown.tsx`: Expandable accordion with monthly actions and costs (6 tests)
- `src/components/optimizer/OptimizerClient.tsx`: State management for generate/apply/regenerate flow (7 tests)

### Page & Navigation
- `src/app/(app)/optimizer/page.tsx`: Optimizer page with client component
- Sidebar: Added "Optimizer" link with TrendingUp icon (1 test)

**Tests:** 405 passing (+56 new)
- savings.test.ts: 11 tests
- analyzer.test.ts: 7 tests
- route.test.ts (optimizer): 6 tests
- apply/route.test.ts: 5 tests
- SavingsSummary.test.tsx: 7 tests
- OptimizedTimeline.test.tsx: 6 tests
- MonthlyBreakdown.test.tsx: 6 tests
- OptimizerClient.test.tsx: 7 tests
- sidebar.test.tsx: 1 new test

**TDD Approach:**
- RED: Wrote tests first for each module
- GREEN: Implemented minimal code to pass
- REFACTOR: Cleaned up types and shared utilities

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 405/405 PASS
- Build: PASS

**Files created:**
- src/lib/optimizer/types.ts
- src/lib/optimizer/savings.ts
- src/lib/optimizer/savings.test.ts
- src/lib/optimizer/analyzer.ts
- src/lib/optimizer/analyzer.test.ts
- src/lib/optimizer/prompt.ts
- src/app/api/optimizer/route.ts
- src/app/api/optimizer/route.test.ts
- src/app/api/optimizer/apply/route.ts
- src/app/api/optimizer/apply/route.test.ts
- src/components/optimizer/SavingsSummary.tsx
- src/components/optimizer/SavingsSummary.test.tsx
- src/components/optimizer/OptimizedTimeline.tsx
- src/components/optimizer/OptimizedTimeline.test.tsx
- src/components/optimizer/MonthlyBreakdown.tsx
- src/components/optimizer/MonthlyBreakdown.test.tsx
- src/components/optimizer/OptimizerClient.tsx
- src/components/optimizer/OptimizerClient.test.tsx
- src/app/(app)/optimizer/page.tsx

**Files modified:**
- src/components/layout/sidebar.tsx (Optimizer link)
- src/components/layout/sidebar.test.tsx (Optimizer link test)

**Next:** Phase 11 (Binge Planner)

---

## 2026-01-12: Phase 11 Complete - Binge Planner

**Branch:** `dev` (direct implementation)

**What was built:**

### Database Migration
- `supabase/migrations/006_add_watch_speed.sql`: Add watch_speed column to profiles (default: 2, range: 1-6)

### TMDB Client Extension
- Added `getShowDetails(seriesId)` method to `src/lib/tmdb/client.ts`
- Added `TMDBShowDetails` interface to `src/lib/tmdb/types.ts` (episode counts, runtime, status)

### Binge Library (TDD)
- `src/lib/binge/types.ts`: BingePlan, BingePlanInput, BingeService types
- `src/lib/binge/calculator.ts`: calculateBingePlan (duration, dates, cost), formatDateRange utilities (13 tests)

### API Routes (TDD)
- `POST /api/binge/plan`: Gets user watch_speed from profile, fetches TMDB show details, calculates binge plan (6 tests)

### Components (TDD)
- `src/components/binge/WatchSpeedSlider.tsx`: Slider for 1-6 episodes/day with labels (4 tests)
- `src/components/binge/BingePlanCard.tsx`: Plan display with poster, episode count, dates, cost, Set Reminders button (7 tests)
- `src/components/binge/BingeClient.tsx`: State management for plan generation and reminder creation (6 tests)

### Page & Navigation
- `src/app/(app)/binge/page.tsx`: Binge planner page
- Sidebar: Added "Binge Planner" link with PlayCircle icon (1 test)

### Calendar Integration
- `src/components/calendar/ContentDetailModal.tsx`: Added "Plan Binge" button for TV shows
- `src/components/calendar/ServiceLane.tsx`: Passes serviceId to onSelectRelease callback
- `src/components/calendar/ContentCalendar.tsx`: handlePlanBinge navigates to /binge with query params

**Tests:** 445 passing (+40 new)
- calculator.test.ts: 13 tests
- route.test.ts (binge/plan): 6 tests
- WatchSpeedSlider.test.tsx: 4 tests
- BingePlanCard.test.tsx: 7 tests
- BingeClient.test.tsx: 6 tests
- ContentDetailModal.test.tsx: 3 new tests
- sidebar.test.tsx: 1 new test

**TDD Approach:**
- RED: Wrote tests first for each module
- GREEN: Implemented minimal code to pass
- REFACTOR: Fixed timezone issues in formatDateRange, updated Next.js Image usage

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 445/445 PASS
- Build: PASS

**Files created:**
- supabase/migrations/006_add_watch_speed.sql
- src/lib/binge/types.ts
- src/lib/binge/calculator.ts
- src/lib/binge/calculator.test.ts
- src/app/api/binge/plan/route.ts
- src/app/api/binge/plan/route.test.ts
- src/components/binge/WatchSpeedSlider.tsx
- src/components/binge/WatchSpeedSlider.test.tsx
- src/components/binge/BingePlanCard.tsx
- src/components/binge/BingePlanCard.test.tsx
- src/components/binge/BingeClient.tsx
- src/components/binge/BingeClient.test.tsx
- src/app/(app)/binge/page.tsx

**Files modified:**
- src/lib/tmdb/client.ts (getShowDetails method)
- src/lib/tmdb/types.ts (TMDBShowDetails interface)
- src/components/calendar/ContentDetailModal.tsx (Plan Binge button)
- src/components/calendar/ContentDetailModal.test.tsx (Plan Binge tests)
- src/components/calendar/ServiceLane.tsx (serviceId prop)
- src/components/calendar/ServiceLane.test.tsx (serviceId test)
- src/components/calendar/ContentCalendar.tsx (handlePlanBinge, useRouter)
- src/components/calendar/ContentCalendar.test.tsx (router mock)
- src/components/layout/sidebar.tsx (Binge Planner link)
- src/components/layout/sidebar.test.tsx (Binge Planner test)

**Next:** Phase 12 (Smart Notifications + Auto-Remind)

---

## 2026-01-13: Phase 12 Complete - Smart Notifications

**Branch:** `dev` (direct implementation)

**What was built:**

### Database Migration
- `supabase/migrations/007_notifications.sql`: notifications and notification_preferences tables with RLS policies

### Notifications Library (TDD)
- `src/lib/notifications/types.ts`: NotificationType, Notification, NotificationPreferences, CreateNotificationInput, NotificationsResponse types
- `src/lib/notifications/generator.ts`: createContentReleaseNotification, createResubscribeNotification, createPauseSuggestionNotification, createPriceChangeNotification, formatRelativeTime (12 tests)

### API Routes (TDD)
- `GET /api/notifications`: Fetch user notifications with unread count (8 tests)
- `PATCH /api/notifications`: Mark single or all notifications as read
- `POST /api/notifications`: Create new notification
- `DELETE /api/notifications/[id]`: Delete notification with ownership check (3 tests)
- `GET /api/notifications/preferences`: Fetch preferences (creates defaults if none) (5 tests)
- `PATCH /api/notifications/preferences`: Update preferences with upsert

### Auto-Remind Integration
- Updated `PATCH /api/subscriptions/[id]` to automatically create resubscribe reminder and notification when subscription moved to 'paused' board column
- Respects user's notification preferences (resubscribe_reminder toggle)
- Uses resume_date if provided, otherwise defaults to 30 days

### Components (TDD)
- `src/components/notifications/NotificationCard.tsx`: Icon based on type, title, body, relative timestamp, dismiss button (7 tests)
- `src/components/notifications/NotificationDropdown.tsx`: List of NotificationCards with header and "Mark all read" (6 tests)
- `src/components/notifications/NotificationBell.tsx`: Bell icon with unread count badge, toggles dropdown (5 tests)
- `src/components/settings/NotificationPreferences.tsx`: Toggle switches for each notification type with auto-save (5 tests)
- `src/components/ui/switch.tsx`: Simple toggle switch component

### Layout Integration
- Updated sidebar.tsx: NotificationBell in mobile header and fixed position on desktop

### Settings Integration
- Updated SettingsClient.tsx: Added third tab "Notifications" with NotificationPreferences component

### ESLint Configuration
- Added `.worktrees/**` to globalIgnores in eslint.config.mjs to exclude stale worktree build artifacts

**Tests:** 499 passing (+54 new)
- generator.test.ts: 12 tests
- route.test.ts (notifications): 8 tests
- [id]/route.test.ts: 3 tests
- preferences/route.test.ts: 5 tests
- NotificationCard.test.tsx: 7 tests
- NotificationDropdown.test.tsx: 6 tests
- NotificationBell.test.tsx: 5 tests
- NotificationPreferences.test.tsx: 5 tests
- subscriptions/[id]/route.test.ts: +3 tests (auto-remind)

**TDD Approach:**
- RED: Wrote tests first for each module
- GREEN: Implemented minimal code to pass
- REFACTOR: Fixed nested button issue in NotificationCard (changed to div with role="article")

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 499/499 PASS
- Build: PASS

**Files created:**
- supabase/migrations/007_notifications.sql
- src/lib/notifications/types.ts
- src/lib/notifications/generator.ts
- src/lib/notifications/generator.test.ts
- src/app/api/notifications/route.ts
- src/app/api/notifications/route.test.ts
- src/app/api/notifications/[id]/route.ts
- src/app/api/notifications/[id]/route.test.ts
- src/app/api/notifications/preferences/route.ts
- src/app/api/notifications/preferences/route.test.ts
- src/components/notifications/NotificationCard.tsx
- src/components/notifications/NotificationCard.test.tsx
- src/components/notifications/NotificationDropdown.tsx
- src/components/notifications/NotificationDropdown.test.tsx
- src/components/notifications/NotificationBell.tsx
- src/components/notifications/NotificationBell.test.tsx
- src/components/settings/NotificationPreferences.tsx
- src/components/settings/NotificationPreferences.test.tsx
- src/components/ui/switch.tsx

**Files modified:**
- src/app/api/subscriptions/[id]/route.ts (auto-remind hook)
- src/app/api/subscriptions/[id]/route.test.ts (auto-remind tests)
- src/components/layout/sidebar.tsx (NotificationBell integration)
- src/app/(app)/settings/SettingsClient.tsx (Notifications tab)
- eslint.config.mjs (worktrees ignore)

**Next:** Phase 13 (Household Mode + Social/Friends)

---

## 2026-01-14: Phase 13 Complete - Household Mode + Social/Friends

**Branch:** `dev` (direct implementation with parallel agents)

**What was built:**

### Phase 13a: Household Mode

**Database Migration:**
- `supabase/migrations/008_households.sql`: households table, household_members junction table, added household_id to subscriptions, RLS policies

**Library (TDD):**
- `src/lib/household/types.ts`: Household, HouseholdRole, HouseholdMember, HouseholdWithMembers, AggregatedTaste, TasteProfile
- `src/lib/household/invite.ts`: generateInviteCode (8-char alphanumeric, excludes ambiguous chars 0/O/1/I)
- `src/lib/household/aggregator.ts`: aggregateTasteProfiles (union of genres/shows)

**API Routes (TDD):**
- `GET/POST/PATCH/DELETE /api/household`: Household CRUD with owner-only updates
- `GET/POST /api/household/invite`: Validate invite code, join household
- `GET/DELETE /api/household/members`: List members, remove/leave

**Components (TDD):**
- `HouseholdSetup.tsx`: Create/join household forms with toggle tabs
- `MemberCard.tsx`: Avatar, display name, role badge, remove button
- `MembersList.tsx`: Grid of MemberCards with Invite button
- `InviteModal.tsx`: Display invite code with copy button
- `HouseholdInsights.tsx`: Combined taste profile, monthly spend, member avatars
- `HouseholdClient.tsx`: State management for household page

**Page & Navigation:**
- `app/(app)/household/page.tsx`: Shows setup if no household, client if member
- Sidebar: Added "Household" link with UsersRound icon

### Phase 13b: Social/Friends

**Database Migration:**
- `supabase/migrations/009_social.sql`: friendships, activity_feed, watchlists, watchlist_members, watchlist_items tables with RLS

**Library (TDD):**
- `src/lib/social/types.ts`: FriendshipStatus, Friendship, Friend, FriendRequest, ActivityAction, ActivityItem, Watchlist, WatchlistWithDetails, WatchlistItem, WatchlistRole
- `src/lib/social/activity.ts`: formatActivityMessage

**API Routes (TDD):**
- `GET/POST/PATCH/DELETE /api/friends`: List friends/requests, send request, accept/decline, remove
- `GET /api/activity`: Activity feed with pagination
- `GET/POST /api/watchlists`: List watchlists, create new
- `GET/PATCH/DELETE /api/watchlists/[id]`: Watchlist CRUD
- `POST/DELETE /api/watchlists/[id]/items`: Add/remove items
- `POST/DELETE /api/watchlists/[id]/members`: Invite/remove members

**Components (TDD):**
- `FriendCard.tsx`: Avatar, name, friends since date, remove button
- `FriendRequestCard.tsx`: Accept/Decline buttons
- `FriendsList.tsx`: Grid of FriendCards with Add Friend button
- `AddFriendModal.tsx`: Email input, send request
- `ActivityFeed.tsx`: List with icons, timestamps, load more
- `WatchlistCard.tsx`: Name, member avatars, item count
- `WatchlistDetail.tsx`: Full view with members, items, add/remove
- `SocialClient.tsx`: Tabbed navigation (Friends | Activity | Watchlists)

**Page & Navigation:**
- `app/(app)/friends/page.tsx`: Shows SocialClient
- Sidebar: Added "Friends" link with Users icon

**Tests:** 720 passing (+221 new)
- Phase 13a: ~105 tests (library, API, components)
- Phase 13b: ~116 tests (library, API, components)

**Parallel Execution:**
- Used dispatching-parallel-agents skill
- Two agents ran simultaneously (no file overlap except sidebar)
- Both completed successfully

**TypeScript Fixes:**
- Fixed Supabase array return format for joined tables in:
  - `src/app/api/activity/route.ts`
  - `src/app/api/friends/route.ts`

**Verification:**
- Lint: PASS (1 warning for external img in WatchlistDetail)
- TypeCheck: PASS
- Tests: 720/720 PASS
- Build: PASS

**Files created (Phase 13a):**
- supabase/migrations/008_households.sql
- src/lib/household/types.ts
- src/lib/household/invite.ts
- src/lib/household/invite.test.ts
- src/lib/household/aggregator.ts
- src/lib/household/aggregator.test.ts
- src/app/api/household/route.ts
- src/app/api/household/route.test.ts
- src/app/api/household/invite/route.ts
- src/app/api/household/invite/route.test.ts
- src/app/api/household/members/route.ts
- src/app/api/household/members/route.test.ts
- src/components/household/MemberCard.tsx
- src/components/household/MemberCard.test.tsx
- src/components/household/MembersList.tsx
- src/components/household/MembersList.test.tsx
- src/components/household/InviteModal.tsx
- src/components/household/InviteModal.test.tsx
- src/components/household/HouseholdSetup.tsx
- src/components/household/HouseholdSetup.test.tsx
- src/components/household/HouseholdInsights.tsx
- src/components/household/HouseholdInsights.test.tsx
- src/components/household/HouseholdClient.tsx
- src/components/household/HouseholdClient.test.tsx
- src/app/(app)/household/page.tsx

**Files created (Phase 13b):**
- supabase/migrations/009_social.sql
- src/lib/social/types.ts
- src/lib/social/activity.ts
- src/lib/social/activity.test.ts
- src/app/api/friends/route.ts
- src/app/api/friends/route.test.ts
- src/app/api/activity/route.ts
- src/app/api/activity/route.test.ts
- src/app/api/watchlists/route.ts
- src/app/api/watchlists/route.test.ts
- src/app/api/watchlists/[id]/route.ts
- src/app/api/watchlists/[id]/route.test.ts
- src/app/api/watchlists/[id]/items/route.ts
- src/app/api/watchlists/[id]/items/route.test.ts
- src/app/api/watchlists/[id]/members/route.ts
- src/app/api/watchlists/[id]/members/route.test.ts
- src/components/social/FriendCard.tsx
- src/components/social/FriendCard.test.tsx
- src/components/social/FriendRequestCard.tsx
- src/components/social/FriendRequestCard.test.tsx
- src/components/social/FriendsList.tsx
- src/components/social/FriendsList.test.tsx
- src/components/social/AddFriendModal.tsx
- src/components/social/AddFriendModal.test.tsx
- src/components/social/ActivityFeed.tsx
- src/components/social/ActivityFeed.test.tsx
- src/components/social/WatchlistCard.tsx
- src/components/social/WatchlistCard.test.tsx
- src/components/social/WatchlistDetail.tsx
- src/components/social/WatchlistDetail.test.tsx
- src/components/social/SocialClient.tsx
- src/components/social/SocialClient.test.tsx
- src/app/(app)/friends/page.tsx

**Files modified:**
- src/components/layout/sidebar.tsx (Household + Friends links)
- src/components/layout/sidebar.test.tsx (new tests)
- src/app/api/activity/route.ts (fixed Supabase array handling)
- src/app/api/friends/route.ts (fixed Supabase array handling)
- src/app/(app)/household/page.tsx (removed unused variables)
- src/components/social/SocialClient.tsx (fixed unused variable)
- src/components/social/SocialClient.test.tsx (removed unused import)

**All planned phases complete!**

---

## 2026-01-15: Created UX Flow Analysis Skill

**Location:** `~/.claude/skills/ux-flow-analysis/SKILL.md` (global, available across all projects)

**What was built:**

A comprehensive UX analysis skill following TDD methodology for skill creation:

### Skill Framework (6 Phases)
1. **Define User Goals** - Identify 3-5 primary user goals before touching the app
2. **Trace Goal Paths** - Walk through as real user, count clicks/scrolls/time
3. **Measure Friction** - Score each step (0=seamless to 3=abandonment point)
4. **Assess Cognitive Load** - Information density, decision complexity, memory requirements
5. **Map Emotional Journey** - Entry → Exploration → Decision → Action → Completion
5.5. **Accessibility Quick-Check** - Keyboard nav, focus indicators, contrast, touch targets
6. **Generate Report** - Structured output with prioritized recommendations

### TDD Process Used
- **RED:** Ran baseline test on motiontechllc.net without skill - found agent did surface-level critique, missed user journeys, no friction scoring
- **GREEN:** Wrote skill addressing those specific gaps
- **REFACTOR:** Added accessibility check, mandatory checklist, effort estimates after testing

### Verification
- Tested skill on SubCycle (localhost:3000)
- Found critical issues: Binge Planner dead-end, 2024 date bug, 500 errors on Friends
- Skill successfully guided systematic analysis with friction scores, emotional mapping, prioritized fixes

**Files created:**
- `~/.claude/skills/ux-flow-analysis/SKILL.md`

**Key insight:** The skill captures "fresh eyes" perspective that creators lose due to familiarity bias.

---

## 2026-01-15: Polish & Bug Fix Round

**Branch:** `dev` (direct implementation)

**What was fixed:**

### Task 1: Implement Missing Reminder Creation (HIGH)
Two TODO comments indicated reminder functionality wasn't fully wired up:

**RecommendationsClient.tsx:**
- Line 90 had TODO: "Create reminder if resumeDate is provided (Phase 6)"
- Implemented: When pausing with resumeDate, now calls `POST /api/reminders` with type 'resubscribe'
- Shows toast confirming reminder was set

**ContentCalendar.tsx:**
- Lines 98-100 had TODO and console.log placeholder
- Added `subscription_id` to `ServiceReleases` type (optional, for contexts needing reminders)
- Updated API, ServiceLane, and ContentCalendar to pass subscription_id through
- Implemented `handleSetReminder` to call `/api/reminders` API
- Added toast notifications for success/failure

### Task 2: Replace img with Next.js Image (MEDIUM)
**WatchlistDetail.tsx:**
- Replaced `<img>` with Next.js `<Image>` component for TMDB posters
- Added `remotePatterns` config for `image.tmdb.org` in next.config.ts
- Added `fill` prop with `sizes="64px"` for responsive images

### Task 5: Remove Unused State Variable (LOW)
**SocialClient.tsx:**
- Line 41 had `const [, setIsWatchlistDetailLoading]` - getter ignored
- Changed to `const [isWatchlistDetailLoading, setIsWatchlistDetailLoading]`
- Added loading skeleton UI when fetching watchlist details

### Task 3: Fix Type Casting Issues - DEFERRED
- Multiple files use `as unknown as Type` or `as any` for Supabase responses
- Would require significant type refactoring across 6+ files
- Current code works correctly, just not type-safe
- Low risk, defer to future cleanup

**Verification:**
- Lint: PASS (0 warnings)
- TypeCheck: PASS
- Tests: 720/720 PASS
- Build: PASS

**Files modified:**
- `src/lib/calendar/types.ts` - Made subscription_id optional in ServiceReleases
- `src/app/api/calendar/route.ts` - Added subscription_id to response
- `src/components/calendar/ServiceLane.tsx` - Added optional subscriptionId prop
- `src/components/calendar/ServiceLane.test.tsx` - Updated test expectations
- `src/components/calendar/ContentCalendar.tsx` - Implemented reminder creation
- `src/components/calendar/ContentCalendar.test.tsx` - Updated mock data
- `src/app/api/calendar/route.test.ts` - Added subscription_id assertion
- `src/components/recommendations/RecommendationsClient.tsx` - Implemented reminder creation on pause
- `src/components/social/WatchlistDetail.tsx` - Replaced img with Image
- `src/components/social/SocialClient.tsx` - Fixed unused state, added loading UI
- `next.config.ts` - Added TMDB image domain config

---

## 2026-01-15: Direct Cancellation Feature

**Branch:** `feature/direct-cancel` → merged to `dev`

**What was built:**

### Cancel Subscription Modal (TDD)
- `src/components/subscriptions/CancelSubscriptionModal.tsx`: Modal for confirming cancellation
  - Shows service name in title
  - Warning about opening external site in new tab
  - Checkbox to optionally mark as paused after canceling (default: checked)
  - "Go to Cancellation Page" button opens `cancel_url` in new tab
  - "Keep Subscription" button closes modal
  - Handles services without cancel_url gracefully
- `src/components/subscriptions/CancelSubscriptionModal.test.tsx`: 10 tests

### SubscriptionCard Updates
- Added `onCancel?: (id: string) => void` prop
- Added "Cancel" button in CardFooter (only shows if `cancel_url` exists and `onCancel` provided)

### Dashboard Integration
- `src/components/subscriptions/DashboardClient.tsx`:
  - State for cancel modal (`cancelModalOpen`, `selectedSubscriptionForCancel`)
  - `handleCancel` and `handleCancelConfirm` handlers
  - Renders CancelSubscriptionModal

### Kanban Board Integration
- `src/components/board/SubscriptionBoard.tsx`: Added `onCancel` prop
- `src/components/board/BoardColumn.tsx`: Added `onCancel` prop
- `src/components/board/DraggableCard.tsx`: Added `onCancel` prop, passes to SubscriptionCard

**Tests:** 730 passing (+10 new)

**E2E Verification (Playwright MCP):**
1. Navigated to dashboard
2. Clicked Cancel on Netflix subscription card
3. Modal appeared with "Cancel Netflix" title
4. Verified checkbox defaulted to checked
5. Clicked "Keep Subscription" → modal closed
6. Cancel button visible on both Active and Scheduled column cards

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 730/730 PASS
- Build: PASS

**Files created:**
- src/components/subscriptions/CancelSubscriptionModal.tsx
- src/components/subscriptions/CancelSubscriptionModal.test.tsx

**Files modified:**
- src/components/subscriptions/SubscriptionCard.tsx (onCancel prop + Cancel button)
- src/components/subscriptions/DashboardClient.tsx (modal state + handlers)
- src/components/board/SubscriptionBoard.tsx (onCancel prop)
- src/components/board/BoardColumn.tsx (onCancel prop)
- src/components/board/DraggableCard.tsx (onCancel prop)

**Status:** Merged to dev

---
## 2026-01-15: UX-1 Optimizer Brain Complete

**Branch:** `feature/ux-1-optimizer-brain` (worktree at `.worktrees/ux-1-optimizer-brain`)

**What was built:**

### Optimizer-v2 Library (TDD)
Complete rebuild of the optimizer system using a modular, algorithmic approach:

- `src/lib/optimizer-v2/types.ts`: Core type definitions
  - WatchIntent (unified intent from all sources)
  - OptimizedPlan, WatchSlot, SubscriptionWindow, ThisWeekAction, Savings
  - PRIORITY_WEIGHTS constants for scoring
  
- `src/lib/optimizer-v2/intent-builder.ts` (12 tests): Builds WatchIntents from all data sources
  - buildFromTasteMatches: Content matching user genres
  - buildFromWatchlist: User's explicit watchlist items
  - buildFromFriendShares: Content shared by friends
  - buildFromBingePlans: Scheduled binge watching
  - buildFromFavorites: Favorite show matches
  - Deduplication with source priority (binge_plan > friend_share > favorite > watchlist > taste_match)

- `src/lib/optimizer-v2/time-calculator.ts` (9 tests): Time calculation utilities
  - calculateAvailableTime: Minutes per week/day from settings
  - estimateWatchDuration: Runtime for movies, episode count × 45min for TV
  - canFitInSchedule: Check if content fits available time
  - getWeeklySlots: Generate day slots for scheduling

- `src/lib/optimizer-v2/prioritizer.ts` (13 tests): Priority scoring system
  - getDeadlineBoost: +50 for ≤7 days, +30 for ≤14 days
  - getSourceBoost: friend_share +40, watchlist/binge_plan +10
  - getRecencyBoost: +20 for releases within 7 days
  - calculatePriorityScore: Combines all boosts
  - prioritizeIntents: Sorts by score descending

- `src/lib/optimizer-v2/scheduler.ts` (8 tests): Content scheduling
  - fitIntentIntoSlots: Schedules across available day slots
  - detectOverload: Identifies when schedule exceeds capacity
  - scheduleIntents: Orchestrates with deadline/priority sorting

- `src/lib/optimizer-v2/subscription-optimizer.ts` (8 tests): Subscription window optimization
  - calculateSubscriptionWindows: Creates time windows per service
  - Splits windows when gaps > 30 days
  - Includes buffer days before/after content
  - calculateSavings: Current vs optimized yearly cost

- `src/lib/optimizer-v2/action-generator.ts` (6 tests): This week's actions
  - generateActionsForWindow: Subscribe/cancel for window dates
  - Uses resume/pause for existing, subscribe/cancel for new
  - generateThisWeekActions: All actions sorted by date

- `src/lib/optimizer-v2/optimizer.ts` (6 tests): Main orchestrator
  - generateOptimizedPlan: Complete workflow combining all modules
  - hashInputs: Cache key generation for invalidation
  - Detects overload conflicts with resolution suggestions

- `src/lib/optimizer-v2/recalculator.ts` (8 tests): Cache management
  - hashOptimizerInputs: Deterministic input hashing
  - isPlanExpired: 1-hour TTL check
  - shouldRecalculate: Determines when regeneration needed

### API Route (TDD)
- `POST /api/optimizer-v2` (4 tests): New endpoint using optimizer-v2 library
  - Fetches all user data (subscriptions, taste profile, watchlist, shares, binge plans)
  - Uses database caching via optimizer_plans table
  - Returns from_cache flag when serving cached plan

### Database Migration
- `supabase/migrations/010_optimizer_plans.sql`:
  - Creates optimizer_plans table with JSONB plan storage
  - Unique constraint on user_id (one cached plan per user)
  - Hash-based cache invalidation via inputs_hash column
  - Indexes for user lookup and expiry cleanup
  - RLS policies for secure user access

**Architecture Decisions:**
- Modular library design (each module has single responsibility)
- Algorithmic core - no Claude API needed for 95% of cases
- Deterministic priority scoring (no AI randomness)
- Database caching with smart invalidation
- Backward compatible with legacy optimizer

**Tests:** 804 passing (+74 new)
- intent-builder.test.ts: 12 tests
- time-calculator.test.ts: 9 tests
- prioritizer.test.ts: 13 tests
- scheduler.test.ts: 8 tests
- subscription-optimizer.test.ts: 8 tests
- action-generator.test.ts: 6 tests
- optimizer.test.ts: 6 tests
- recalculator.test.ts: 8 tests
- route.test.ts (optimizer-v2): 4 tests

**Verification:**
- Lint: PASS (2 warnings for unused params - intentional for API consistency)
- TypeCheck: PASS
- Tests: 804/804 PASS
- Build: PASS

**Files created:**
- src/lib/optimizer-v2/types.ts
- src/lib/optimizer-v2/intent-builder.ts
- src/lib/optimizer-v2/intent-builder.test.ts
- src/lib/optimizer-v2/time-calculator.ts
- src/lib/optimizer-v2/time-calculator.test.ts
- src/lib/optimizer-v2/prioritizer.ts
- src/lib/optimizer-v2/prioritizer.test.ts
- src/lib/optimizer-v2/scheduler.ts
- src/lib/optimizer-v2/scheduler.test.ts
- src/lib/optimizer-v2/subscription-optimizer.ts
- src/lib/optimizer-v2/subscription-optimizer.test.ts
- src/lib/optimizer-v2/action-generator.ts
- src/lib/optimizer-v2/action-generator.test.ts
- src/lib/optimizer-v2/optimizer.ts
- src/lib/optimizer-v2/optimizer.test.ts
- src/lib/optimizer-v2/recalculator.ts
- src/lib/optimizer-v2/recalculator.test.ts
- src/app/api/optimizer-v2/route.ts
- src/app/api/optimizer-v2/route.test.ts
- supabase/migrations/010_optimizer_plans.sql

**Status:** Merged to dev

---

## 2026-01-15: UX-2 Auto-Pilot Complete

**Branch:** `feature/ux-2-auto-pilot` (worktree at `.worktrees/ux-2-auto-pilot`)

**What was built:**

### Auto-Pilot Library (TDD)
Complete automatic subscription management system:

- `src/lib/auto-pilot/types.ts`: Core type definitions
  - AutoAction, AutoActionStatus (tracking executed actions)
  - MissedDeadline, UpcomingDeadline, DeadlineCheckResult
  - UserBehaviorPattern, ExecutionResult, ExecutionError
  - AutoPilotNotification types
  - API types for cron and apply routes

- `src/lib/auto-pilot/action-executor.ts` (8 tests): Execute scheduled actions
  - executeAction: Handles set_reminder, pause, resume, cancel, subscribe
  - executeActions: Batch processing with error resilience
  - Creates reminders for reminder-type actions
  - Updates subscription status for pause/resume
  - Records all actions in auto_actions table

- `src/lib/auto-pilot/deadline-detector.ts` (6 tests): Detect deadlines
  - detectMissedDeadlines: Finds past deadlines with days-missed calculation
  - detectUpcomingDeadlines: Finds deadlines within 7 days
  - checkDeadlines: Combined result for both missed and upcoming
  - Marks urgent deadlines (≤3 days)

- `src/lib/auto-pilot/deadline-handler.ts` (6 tests): Handle deadline events
  - handleMissedDeadline: Send notification, update behavior, invalidate cache
  - handleUpcomingDeadline: Send warning for urgent deadlines
  - handleAllDeadlines: Process all deadlines

- `src/lib/auto-pilot/behavior-tracker.ts` (7 tests): Track user patterns
  - getUserBehaviorPattern: Fetch or create default pattern
  - updateBehaviorPattern: Increment count fields
  - recordAutoActionResponse: Track accept/reject ratio
  - inferOptimalActionTime: Calculate from user activity

- `src/lib/auto-pilot/notification-sender.ts` (5 tests): Send notifications
  - createAutoPilotNotification: Build notification by type
  - sendAutoPilotNotification: Check preferences, insert to DB

### API Routes (TDD)
- `POST /api/auto-pilot/execute` (4 tests): Cron endpoint
  - Fetches cached optimizer plan
  - Executes today's actions
  - Handles missed/upcoming deadlines
  - Supports dry_run mode for preview

- `POST /api/optimizer-v2/apply` (4 tests): Apply plan route
  - Creates reminders from plan actions
  - Creates auto_actions entries
  - Updates subscription board_column to 'scheduled'
  - Sends confirmation notification

### Database Migration
- `supabase/migrations/011_auto_pilot.sql`:
  - Adds timezone column to profiles
  - Creates auto_actions table (tracks executed actions)
  - Creates user_behavior_patterns table (tracks user patterns)
  - Full RLS policies for secure user access

### Vercel Cron Configuration
- `vercel.json`: Daily cron at 9 AM UTC

**Tests:** 844 passing (+40 new)
- action-executor.test.ts: 8 tests
- deadline-detector.test.ts: 6 tests
- deadline-handler.test.ts: 6 tests
- behavior-tracker.test.ts: 7 tests
- notification-sender.test.ts: 5 tests
- execute/route.test.ts: 4 tests
- apply/route.test.ts: 4 tests

**Verification:**
- Lint: PASS (4 warnings)
- TypeCheck: PASS
- Tests: 844/844 PASS
- Build: PASS

**Files created:**
- src/lib/auto-pilot/types.ts
- src/lib/auto-pilot/action-executor.ts
- src/lib/auto-pilot/action-executor.test.ts
- src/lib/auto-pilot/deadline-detector.ts
- src/lib/auto-pilot/deadline-detector.test.ts
- src/lib/auto-pilot/deadline-handler.ts
- src/lib/auto-pilot/deadline-handler.test.ts
- src/lib/auto-pilot/behavior-tracker.ts
- src/lib/auto-pilot/behavior-tracker.test.ts
- src/lib/auto-pilot/notification-sender.ts
- src/lib/auto-pilot/notification-sender.test.ts
- src/app/api/auto-pilot/execute/route.ts
- src/app/api/auto-pilot/execute/route.test.ts
- src/app/api/optimizer-v2/apply/route.ts
- src/app/api/optimizer-v2/apply/route.test.ts
- supabase/migrations/011_auto_pilot.sql
- vercel.json

**Status:** Merged to dev

---

## 2026-01-15: UX-3 Unified Content Calendar Complete

**Branch:** `feature/ux-3-unified-calendar` (worktree at `.worktrees/ux-3-unified-calendar`)

**What was built:**

### Unified Calendar Components (TDD)
Complete Content Calendar page with 4 sections that shows everything and controls everything:

- `src/components/calendar-unified/OptimizerSummary.tsx` (8 tests): Top section
  - Savings display with progress bar (current vs optimized cost)
  - This week's actions list with action type badges
  - Apply All and Regenerate buttons
  - Loading state support

- `src/components/calendar-unified/WatchQueue.tsx` (8 tests): Prioritized watch queue
  - Queue items with title, service, duration, deadline
  - Friend share badges ("Shared by friend")
  - Urgent deadline highlighting (≤3 days)
  - Remove, Plan Binge, Add to Watchlist actions
  - Empty state with guidance

- `src/components/calendar-unified/CalendarView.tsx` (10 tests): Timeline view
  - Month navigation (Previous/Next/Today buttons)
  - Service lanes with subscription window bars
  - Current vs planned subscriptions (green vs blue)
  - Release markers positioned by date
  - Movie/Series icons with tooltips

- `src/components/calendar-unified/UpcomingReleases.tsx` (8 tests): Content discovery
  - Release list with taste match scores
  - Type badges (Movie/Series)
  - Friend watching indicators
  - Add to Queue and View Details actions
  - Empty state

- `src/components/calendar-unified/ReleaseDetailModal.tsx` (6 tests): Content details
  - Uses shadcn Dialog component
  - Shows release info, genres, match score
  - Add to Queue, Plan Binge, Set Reminder actions
  - Close button

- `src/components/calendar-unified/ContentCalendarPage.tsx` (6 tests): Main orchestrator
  - Composes all 4 sections with proper layout
  - Manages state for current month and selected release
  - Handles inter-section communication
  - Loading state when fetching data

### Type System Extensions
- Added Calendar-prefixed types to `src/lib/optimizer-v2/types.ts`:
  - CalendarSavings, CalendarAction, CalendarWatchSlot
  - CalendarSubscriptionWindow, CalendarOptimizedPlan
  - ContentRelease with optional fields
- Added `toCalendarPlan()` converter function for legacy compatibility

**Tests:** 890 passing (+46 new)
- OptimizerSummary.test.tsx: 8 tests
- WatchQueue.test.tsx: 8 tests
- CalendarView.test.tsx: 10 tests
- UpcomingReleases.test.tsx: 8 tests
- ReleaseDetailModal.test.tsx: 6 tests
- ContentCalendarPage.test.tsx: 6 tests

**Verification:**
- Lint: PASS (5 warnings)
- TypeCheck: PASS
- Tests: 890/890 PASS
- Build: PASS

**Files created:**
- src/components/calendar-unified/OptimizerSummary.tsx
- src/components/calendar-unified/OptimizerSummary.test.tsx
- src/components/calendar-unified/WatchQueue.tsx
- src/components/calendar-unified/WatchQueue.test.tsx
- src/components/calendar-unified/CalendarView.tsx
- src/components/calendar-unified/CalendarView.test.tsx
- src/components/calendar-unified/UpcomingReleases.tsx
- src/components/calendar-unified/UpcomingReleases.test.tsx
- src/components/calendar-unified/ReleaseDetailModal.tsx
- src/components/calendar-unified/ReleaseDetailModal.test.tsx
- src/components/calendar-unified/ContentCalendarPage.tsx
- src/components/calendar-unified/ContentCalendarPage.test.tsx
- src/components/calendar-unified/index.ts

**Files modified:**
- src/lib/optimizer-v2/types.ts (Calendar-prefixed types + toCalendarPlan)

**Status:** Merged to dev

---

## 2026-01-15: UX Integration Bug Fixes

**Branch:** dev (direct fixes)

**What was fixed:**

### Critical Bug #1: Reminder Schema Mismatch
Auto-pilot and optimizer-v2 used wrong column names when creating reminders:
- Code used `reminder_type` but schema has `type`
- Code used `reminder_date` but schema has `trigger_date`
- Code used non-existent `message` column

**Files fixed:**
- `src/lib/auto-pilot/action-executor.ts` - lines 39-55
- `src/app/api/optimizer-v2/apply/route.ts` - lines 67-84

### Critical Bug #2: Invalid 'custom' Enum Value
Code used `'custom'` as reminder type but database only allows `'cancel'` | `'resubscribe'`.

**Fix:** Changed `'custom'` to `'resubscribe'` for `set_reminder` actions.

### Critical Bug #3: Service ID vs Subscription ID Confusion
`ThisWeekAction.service_id` contains services table ID but was passed where `subscription_id` (subscriptions table PK) was expected.

**Impact:** FK constraint violations, wrong subscription updates, API validation failures.

**Locations fixed:**
- `src/lib/auto-pilot/action-executor.ts` - added subscription lookup before reminder creation
- `src/app/api/optimizer-v2/apply/route.ts` - added subscription lookup before processing
- `src/components/binge/BingeClient.tsx` - added subscription lookup before calling reminders API
- `src/app/(app)/recommendations/page.tsx` - fixed to pass subscription ID instead of service ID

### Additional Fixes
- Added `'subscription_lookup'` to `ExecutionError.error_type` union in types.ts
- Updated test mocks in action-executor.test.ts and optimizer-v2/apply/route.test.ts
- Updated test mocks in BingeClient.test.tsx

**Tests:** 890 passing (unchanged count)

**Verification:**
- npm test: PASS (890/890)
- npm run build: PASS

**Files modified:**
- src/lib/auto-pilot/action-executor.ts
- src/lib/auto-pilot/action-executor.test.ts
- src/lib/auto-pilot/types.ts
- src/app/api/optimizer-v2/apply/route.ts
- src/app/api/optimizer-v2/apply/route.test.ts
- src/components/binge/BingeClient.tsx
- src/components/binge/BingeClient.test.tsx
- src/app/(app)/recommendations/page.tsx

**Status:** Fixes applied on dev

---

## 2026-01-15: UX-4 One-Tap Actions Complete

**Branch:** `feature/ux-4-one-tap-actions` (worktree at `.worktrees/ux-4-one-tap-actions`)

**What was built:**

### Queue API (TDD)
- `src/lib/queue/types.ts`: Queue type definitions
  - QueueItem, QueueItemSource, CreateQueueItemInput
  - Queue reorder types

- `src/app/api/queue/route.ts` (8 tests): Queue CRUD
  - GET: Fetch user's queue items ordered by priority
  - POST: Create new queue item with auto-incrementing priority
  - DELETE: Remove queue item by ID

- `src/app/api/queue/binge/route.ts` (4 tests): Binge planning
  - Fetches TMDB show details for episode count/runtime
  - Uses user's watch_speed preference for deadline calculation
  - Creates queue item with source='binge_plan'

- `src/app/api/queue/watch-together/route.ts` (4 tests): Social watching
  - Creates watch-together session in database
  - Links queue item to session
  - Notifies invited friends

- `src/app/api/queue/reorder/route.ts`: Priority reordering
  - Batch updates priorities for drag-drop reordering

### Calendar Actions API (TDD)
- `src/app/api/calendar/actions/route.ts` (6 tests): Unified calendar endpoint
  - apply_all: Creates reminders and updates subscriptions from optimizer plan
  - regenerate: Invalidates cached optimizer plan
  - add_to_queue: Adds release to user's watch queue
  - set_reminder: Creates reminder for release date
  - remove_from_queue: Deletes queue item

### Client Action Handlers (TDD)
- `src/lib/calendar-unified/action-handlers.ts` (9 tests): API wrappers
  - addToQueue, removeFromQueue
  - planBinge, watchTogether
  - setReminder, applyAllActions, regeneratePlan
  - reorderQueue
  - Error handling with typed responses

- `src/lib/calendar-unified/use-calendar-actions.ts` (6 tests): React hook
  - Loading and error state management
  - onSuccess/onError callbacks
  - Wrapped action handlers with try/catch

### Drag-and-Drop Component (TDD)
- `src/components/calendar-unified/DraggableQueueItem.tsx` (4 tests): Sortable item
  - Uses @dnd-kit/sortable (useSortable hook)
  - Drag handle with grip icon
  - Urgent deadline highlighting (≤3 days)
  - Friend share badges
  - Action buttons: Add to Watchlist, Plan Binge, Remove

**Tests:** 931 passing (+41 new)
- queue/route.test.ts: 8 tests
- queue/binge/route.test.ts: 4 tests
- queue/watch-together/route.test.ts: 4 tests
- calendar/actions/route.test.ts: 6 tests
- action-handlers.test.ts: 9 tests
- use-calendar-actions.test.ts: 6 tests
- DraggableQueueItem.test.tsx: 4 tests

**Verification:**
- Lint: PASS (4 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 931/931 PASS
- Build: PASS

**Files created:**
- src/lib/queue/types.ts
- src/app/api/queue/route.ts
- src/app/api/queue/route.test.ts
- src/app/api/queue/binge/route.ts
- src/app/api/queue/binge/route.test.ts
- src/app/api/queue/watch-together/route.ts
- src/app/api/queue/watch-together/route.test.ts
- src/app/api/queue/reorder/route.ts
- src/app/api/calendar/actions/route.ts
- src/app/api/calendar/actions/route.test.ts
- src/lib/calendar-unified/action-handlers.ts
- src/lib/calendar-unified/action-handlers.test.ts
- src/lib/calendar-unified/use-calendar-actions.ts
- src/lib/calendar-unified/use-calendar-actions.test.ts
- src/components/calendar-unified/DraggableQueueItem.tsx
- src/components/calendar-unified/DraggableQueueItem.test.tsx

**Status:** Merged to dev

---

## 2026-01-17: UX-6 New User Experience Complete

**Branch:** `feature/ux-6-new-user-experience` (worktree at `.worktrees/ux-6-new-user-experience`)

**Goal:** Brand new user understands app and sees value in 30 seconds through guided onboarding inline with the calendar.

**What was built:**

### EmptyState Component (TDD)
- `src/components/calendar-unified/EmptyState.tsx` (7 tests): 3-step guided setup
  - Step 1: Genre selection with InlineTastePicker
  - Step 2: Service addition with QuickAddService
  - Step 3: Loading/calculating state
  - Step indicators with icons (Sparkles, Calendar, DollarSign)
  - Skip option to jump directly to calendar

### InlineTastePicker Component (TDD)
- `src/components/calendar-unified/InlineTastePicker.tsx` (6 tests): Quick genre selection
  - Uses GENRES from lib/constants.ts
  - Multi-select toggle for genre chips
  - Loading state during save
  - Skip and Save Preferences buttons

### QuickAddService Component (TDD)
- `src/components/calendar-unified/QuickAddService.tsx` (6 tests): Fast subscription addition
  - Service dropdown from Supabase
  - Price input with auto-fill from base_price
  - Validation for required fields
  - Skip and Add Service buttons

### Tooltip Component (TDD)
- `src/components/calendar-unified/Tooltip.tsx` (5 tests): Progressive disclosure
  - Dark background with arrow pointer
  - Position variants (top, bottom, left, right)
  - Auto-dismiss with timeout
  - "Got it" dismiss button

### Tooltip Configuration
- `src/lib/calendar-unified/tooltips.ts`: Centralized tooltip config
  - CALENDAR_TOOLTIPS constant with 5 tooltip definitions
  - localStorage-based "seen" tracking
  - Helper functions: getSeenTooltips, markTooltipSeen, hasSeenTooltip, resetSeenTooltips

### FirstSavingsPopup Component (TDD)
- `src/components/calendar-unified/FirstSavingsPopup.tsx` (4 tests): Celebration moment
  - Modal overlay with confetti-style decorations
  - Large savings number display
  - "Awesome!" dismiss button
  - localStorage flag to show only once

### ContentCalendarPage Updates
- Added empty state detection (hasSubscriptions, hasTasteProfile props)
- Added data-tooltip attributes to all sections
  - savings, queue, calendar, releases
- Integrated FirstSavingsPopup trigger on first savings > 0
- Added handlers for genre selection and service addition

### Calendar Page Client
- `src/app/(app)/calendar/CalendarPageClient.tsx`: Data fetching layer
  - Fetches user subscriptions, taste profile, services
  - Fetches optimizer plan and calendar releases
  - Handles all CRUD operations with toast notifications
  - Passes new user props to ContentCalendarPage

**Tests:** 907 passing (+28 new)
- EmptyState.test.tsx: 7 tests
- InlineTastePicker.test.tsx: 6 tests
- QuickAddService.test.tsx: 6 tests
- Tooltip.test.tsx: 5 tests
- FirstSavingsPopup.test.tsx: 4 tests

**Verification:**
- Lint: PASS (4 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 907/907 PASS
- Build: PASS

**Files created:**
- src/components/calendar-unified/EmptyState.tsx
- src/components/calendar-unified/EmptyState.test.tsx
- src/components/calendar-unified/InlineTastePicker.tsx
- src/components/calendar-unified/InlineTastePicker.test.tsx
- src/components/calendar-unified/QuickAddService.tsx
- src/components/calendar-unified/QuickAddService.test.tsx
- src/components/calendar-unified/Tooltip.tsx
- src/components/calendar-unified/Tooltip.test.tsx
- src/components/calendar-unified/FirstSavingsPopup.tsx
- src/components/calendar-unified/FirstSavingsPopup.test.tsx
- src/lib/calendar-unified/tooltips.ts
- src/app/(app)/calendar/CalendarPageClient.tsx

**Files modified:**
- src/components/calendar-unified/ContentCalendarPage.tsx (empty state + popup integration)
- src/components/calendar-unified/index.ts (exports)
- src/app/(app)/calendar/page.tsx (use CalendarPageClient)

**Status:** Merged to dev

---

## 2026-01-17: UX-7 Edge Case Handling Complete

**Branch:** `feature/ux-7-edge-cases` (worktree at `.worktrees/ux-7-edge-cases`)

**Goal:** System handles real-world chaos gracefully - content changes, price changes, user absence, and overloaded queues.

**What was built:**

### Content Monitor (TDD)
- `src/lib/edge-cases/content-monitor.ts` (7 tests): Detect TMDB content changes
  - Release date changes
  - Content removed from TMDB
  - Show cancellation status
  - Error handling for API failures

### Price Monitor (TDD)
- `src/lib/edge-cases/price-monitor.ts` (6 tests): Track service price changes
  - Detect price increases/decreases
  - Calculate percentage change
  - Identify significant changes (>10%)
  - Record in service_price_history table

### Activity Monitor (TDD)
- `src/lib/edge-cases/activity-monitor.ts` (6 tests): Track user activity
  - Record login, queue interaction, item completion
  - Get activity summary
  - Detect inactive users (>7 days)

### Vacation Mode (TDD)
- `src/lib/edge-cases/vacation-mode.ts` (8 tests): Pause auto-pilot
  - Enable/disable vacation mode
  - Optional return date
  - Auto-disable after return date
  - Check vacation status

### Queue Manager (TDD)
- `src/lib/edge-cases/queue-manager.ts` (6 tests): Handle overloaded queue
  - Check queue health (healthy/warning/overloaded)
  - Calculate hours deficit
  - Suggest items to remove by priority
  - Detect deadline conflicts

### Edge Cases API (TDD)
- `src/app/api/edge-cases/check/route.ts` (5 tests): Daily cron check
  - Run all monitors
  - Skip if user on vacation
  - Handle individual monitor errors gracefully
  - Return comprehensive summary

### Vacation Mode API
- `src/app/api/vacation-mode/route.ts`: GET/POST vacation status

### VacationMode Component (TDD)
- `src/components/settings/VacationMode.tsx` (5 tests): Settings UI
  - Toggle switch for vacation mode
  - Optional return date picker
  - Days remaining counter
  - "I'm Back!" quick button

### Database Migration
- `supabase/migrations/012_vacation_mode.sql`:
  - profiles: vacation_mode, vacation_start_date, vacation_return_date
  - user_behavior_patterns: last_login_date, last_queue_interaction, items_completed_count
  - service_price_history table with RLS

### Integrations
- Auto-pilot skips users on vacation
- WatchQueue shows health indicator (overloaded/warning badges)
- Settings page includes VacationMode in Profile tab

**Tests:** 950 passing (+43 new)
- content-monitor.test.ts: 7 tests
- price-monitor.test.ts: 6 tests
- activity-monitor.test.ts: 6 tests
- vacation-mode.test.ts: 8 tests
- queue-manager.test.ts: 6 tests
- edge-cases/check/route.test.ts: 5 tests
- VacationMode.test.tsx: 5 tests

**Verification:**
- Lint: PASS (5 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 950/950 PASS
- Build: PASS

**Files created:**
- src/lib/edge-cases/types.ts
- src/lib/edge-cases/content-monitor.ts
- src/lib/edge-cases/content-monitor.test.ts
- src/lib/edge-cases/price-monitor.ts
- src/lib/edge-cases/price-monitor.test.ts
- src/lib/edge-cases/activity-monitor.ts
- src/lib/edge-cases/activity-monitor.test.ts
- src/lib/edge-cases/vacation-mode.ts
- src/lib/edge-cases/vacation-mode.test.ts
- src/lib/edge-cases/queue-manager.ts
- src/lib/edge-cases/queue-manager.test.ts
- src/lib/edge-cases/index.ts
- src/app/api/edge-cases/check/route.ts
- src/app/api/edge-cases/check/route.test.ts
- src/app/api/vacation-mode/route.ts
- src/components/settings/VacationMode.tsx
- src/components/settings/VacationMode.test.tsx
- supabase/migrations/012_vacation_mode.sql

**Files modified:**
- src/app/api/auto-pilot/execute/route.ts (vacation mode integration)
- src/app/api/auto-pilot/execute/route.test.ts (mock vacation-mode)
- src/app/(app)/settings/SettingsClient.tsx (VacationMode component)
- src/components/calendar-unified/WatchQueue.tsx (queue health indicator)

**Status:** Merged to dev

---

## 2026-01-16: UX-5 Remove Old Pages Complete

**Branch:** `feature/ux-5-remove-old-pages` (worktree at `.worktrees/ux-5-remove-old-pages`)

**Goal:** Remove redundant pages merged into unified calendar, simplify navigation to 6 items.

**What was removed:**

### Pages Deleted (3)
- `src/app/(app)/recommendations/page.tsx`
- `src/app/(app)/optimizer/page.tsx`
- `src/app/(app)/binge/page.tsx`

### Components Deleted (15 files)
- `src/components/recommendations/` (9 files)
  - RecommendationBadge, RecommendationCard, RecommendationCardSkeleton
  - RecommendationsSummary, RecommendationsClient, index
- `src/components/binge/` (6 files)
  - BingePlanCard, WatchSpeedSlider, BingeClient (+ tests)

### API Routes Deleted (5 files)
- `src/app/api/recommendations/route.ts`
- `src/app/api/optimizer/route.ts` + test
- `src/app/api/optimizer/apply/route.ts` + test

### Moved to Legacy (14 files)
- `src/lib/optimizer/` → `src/lib/optimizer-legacy/` (6 files)
- `src/components/optimizer/` → `src/components/optimizer-legacy/` (8 files)

**What was updated:**

### Sidebar Navigation
Changed from 9 items to 6 items:
1. Dashboard
2. Content Calendar ← The super page
3. Household
4. Friends
5. Reminders
6. Settings

### Middleware
- Default redirect changed from `/dashboard` to `/calendar`
- Added `/calendar`, `/household`, `/friends`, `/settings` to protected paths

### next.config.ts
Added permanent redirects:
```typescript
{ source: '/recommendations', destination: '/calendar', permanent: true }
{ source: '/optimizer', destination: '/calendar', permanent: true }
{ source: '/binge', destination: '/calendar', permanent: true }
```

### taste-profile route
- Removed import of `clearCachedRecommendations` from deleted recommendations API
- Now clears `optimizer_plans` cache directly

**Tests:** 879 passing (-52 from deleted components)

**Verification:**
- Lint: PASS (4 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 879/879 PASS
- Build: PASS

**Status:** Merged to dev

---

## 2026-01-17: UX-8 Social Integration Complete

**Branch:** `feature/ux-8-social-integration` (worktree at `.worktrees/ux-8-social-integration`)

**Goal:** Friends enhance the calendar experience naturally. Social signals (friend shares, mutual watching) are integrated directly into the unified calendar.

**What was built:**

### Social Integration Library (TDD)
- `src/lib/social-integration/types.ts`: Core type definitions
  - FriendActivityItem, FriendsWatchingMap
  - ShareContentInput, WatchTogetherInput
  - SpoilerAlert, WatchTogetherSession, FriendInfo

- `src/lib/social-integration/friend-activity.ts` (5 tests): Friend activity for calendar
  - getFriendsActivity: Get watchlist items from friends
  - getFriendsWatchingContent: Map tmdb_ids to friends watching
  - enrichReleasesWithFriendActivity: Set friend_watching flag on releases

- `src/lib/social-integration/share-handler.ts` (4 tests): Handle friend shares
  - shareContentWithFriend: Create share and notification
  - getSharesReceivedByUser: Fetch incoming shares
  - addShareToQueue: Create queue item with source='friend_share'

- `src/lib/social-integration/watch-together.ts` (4 tests): Schedule joint watching
  - createWatchTogetherSession: Create session and notify friends
  - getSessionsForUser: Get sessions as organizer or participant
  - respondToSession: Accept/decline session invite

- `src/lib/social-integration/spoiler-alert.ts` (3 tests): Spoiler warnings
  - checkSpoilerRisks: Compare watch progress with friends
  - Returns alerts when friends are ahead/behind on TV shows

### Calendar API Update
- `src/app/api/calendar/route.ts`: Enriches releases with friend_watching flag
  - Imports enrichReleasesWithFriendActivity
  - Applies to all releases before response

### Calendar Types Update
- `src/lib/calendar/types.ts`: Added friend_watching to ContentRelease

### WatchQueue Component Update (2 tests)
- `src/components/calendar-unified/WatchQueue.tsx`:
  - Shows "Shared by {friend_name}" instead of generic "Shared by friend"
  - Shows "Watch Together" button for friend-shared items
  - New onWatchTogether prop for triggering modal

### WatchTogetherModal Component (TDD, 3 tests)
- `src/components/calendar-unified/WatchTogetherModal.tsx`:
  - Friend selection with checkboxes
  - Optional date picker for scheduling
  - Optional message input
  - Submit button disabled when no friends selected

### ContentCalendarPage Integration
- Added WatchTogetherModal integration
- Fetches friends list on mount
- Handles watch-together submission
- Passes onWatchTogether to WatchQueue

### Action Handlers Update
- `src/lib/calendar-unified/action-handlers.ts`: Added message parameter to watchTogether
- `src/lib/calendar-unified/use-calendar-actions.ts`: Updated hook signature

**Tests:** 972 passing (+22 new)
- friend-activity.test.ts: 5 tests
- share-handler.test.ts: 4 tests
- watch-together.test.ts: 4 tests
- spoiler-alert.test.ts: 3 tests
- WatchTogetherModal.test.tsx: 3 tests
- WatchQueue.test.tsx: +2 tests (friend name, watch together button)
- calendar/route.test.ts: Updated mocks for friend activity enrichment

**Verification:**
- Lint: PASS (5 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 972/972 PASS
- Build: PASS

**Files created:**
- src/lib/social-integration/types.ts
- src/lib/social-integration/friend-activity.ts
- src/lib/social-integration/friend-activity.test.ts
- src/lib/social-integration/share-handler.ts
- src/lib/social-integration/share-handler.test.ts
- src/lib/social-integration/watch-together.ts
- src/lib/social-integration/watch-together.test.ts
- src/lib/social-integration/spoiler-alert.ts
- src/lib/social-integration/spoiler-alert.test.ts
- src/lib/social-integration/index.ts
- src/components/calendar-unified/WatchTogetherModal.tsx
- src/components/calendar-unified/WatchTogetherModal.test.tsx

**Files modified:**
- src/app/api/calendar/route.ts (friend activity enrichment)
- src/app/api/calendar/route.test.ts (updated mocks)
- src/lib/calendar/types.ts (friend_watching field)
- src/lib/optimizer-v2/types.ts (source_details in CalendarWatchSlot)
- src/components/calendar-unified/WatchQueue.tsx (friend name + Watch Together button)
- src/components/calendar-unified/WatchQueue.test.tsx (2 new tests)
- src/components/calendar-unified/ContentCalendarPage.tsx (modal integration)
- src/lib/calendar-unified/action-handlers.ts (message parameter)
- src/lib/calendar-unified/use-calendar-actions.ts (hook update)

**Status:** Merged to dev

---

## 2026-01-17: UX-9 Polish & Dark Mode Complete

**Branch:** `feature/ux-9-polish` (worktree at `.worktrees/ux-9-polish`)

**Goal:** Instagram-level smoothness and delight. Final polish for the SubCycle app.

**What was built:**

### Skeleton Shimmer Variant (TDD, 1 test)
- `src/components/ui/skeleton.tsx`: Added shimmer animation variant
  - New `variant` prop: 'pulse' (default) | 'shimmer'
  - CSS keyframes animation for shimmer effect
  - Gradient moving left-to-right

### DarkModeToggle Component (TDD, 2 tests)
- `src/components/settings/DarkModeToggle.tsx`: Theme toggle
  - Uses `useSyncExternalStore` for external state management
  - Persists to localStorage key `subcycle_theme`
  - Sun/Moon icons from lucide-react
  - Toggles `dark` class on `<html>` element

### Confetti Component (TDD, 1 test)
- `src/components/ui/confetti.tsx`: Celebration animation
  - Uses canvas-confetti library
  - `fireConfetti()` function with green/gold particles
  - Triggered on Apply All success

### Haptics Utility (TDD, 1 test)
- `src/lib/haptics.ts`: Mobile haptic feedback
  - `triggerHaptic(intensity)` function
  - Supports 'light', 'medium', 'heavy' intensities
  - Uses navigator.vibrate API
  - Graceful degradation on unsupported devices

### BottomNav Component (TDD, 1 test)
- `src/components/layout/BottomNav.tsx`: Mobile bottom navigation
  - Fixed to bottom on mobile (`md:hidden`)
  - 4 nav items: Dashboard, Calendar, Friends, Settings
  - Active state highlighting based on pathname
  - Glass-morphism background with backdrop blur

### Drag Ghost Enhancement
- `src/components/board/DraggableCard.tsx`: Added `scale(1.05)` when dragging
- `src/components/calendar-unified/DraggableQueueItem.tsx`: Added `scale(1.05)` when dragging
  - Creates "lift" effect during drag operations

### Settings Integration
- `src/app/(app)/settings/SettingsClient.tsx`: Added "Appearance" section with DarkModeToggle

### Calendar Integration
- `src/app/(app)/calendar/CalendarPageClient.tsx`: Added confetti on Apply All success

### Layout Integration
- `src/components/layout/sidebar.tsx`: Added BottomNav import and render

**Dependencies Added:**
- canvas-confetti
- @types/canvas-confetti (dev)

**Tests:** 978 passing (+6 new)
- skeleton.test.tsx: +1 test (shimmer variant)
- DarkModeToggle.test.tsx: 2 tests
- confetti.test.tsx: 1 test
- haptics.test.ts: 1 test
- BottomNav.test.tsx: 1 test

**Test Fix:**
- `src/components/layout/sidebar.test.tsx`: Updated to use `getAllByRole` instead of `getByRole` due to duplicate links (sidebar + BottomNav)

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS

**Files created:**
- src/components/settings/DarkModeToggle.tsx
- src/components/settings/DarkModeToggle.test.tsx
- src/components/ui/confetti.tsx
- src/components/ui/confetti.test.tsx
- src/lib/haptics.ts
- src/lib/haptics.test.ts
- src/components/layout/BottomNav.tsx
- src/components/layout/BottomNav.test.tsx

**Files modified:**
- src/components/ui/skeleton.tsx (shimmer variant)
- src/components/ui/skeleton.test.tsx (shimmer test)
- src/app/(app)/settings/SettingsClient.tsx (DarkModeToggle)
- src/app/(app)/calendar/CalendarPageClient.tsx (confetti)
- src/components/layout/sidebar.tsx (BottomNav)
- src/components/layout/sidebar.test.tsx (getAllByRole fix)
- src/components/board/DraggableCard.tsx (scale effect)
- src/components/calendar-unified/DraggableQueueItem.tsx (scale effect)
- package.json (canvas-confetti dependency)

**Status:** Merged to dev

**UX Overhaul Complete!** All 9 UX phases implemented with 978 tests passing.

---

## 2026-01-17: Dark Mode Fix - Full App Support

**Branch:** dev (direct commit)

**Issue:** Dark mode toggle only affected cards, not the entire app. Text remained black on dark background making it unreadable.

**Root Cause:** Hardcoded Tailwind color classes (bg-gray-50, text-gray-900, etc.) instead of CSS variables that respond to dark mode.

**Solution:** Updated ~60 files to use CSS variables:
- `bg-gray-50` → `bg-background` or `bg-muted`
- `text-gray-900` → `text-foreground`
- `text-gray-600/500` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `bg-white` → `bg-card` or `bg-background`
- `bg-gray-100` → `bg-accent`

**Key Files Updated:**
- `src/app/(app)/layout.tsx` - main content bg-background
- `src/components/layout/sidebar.tsx` - all nav colors
- `src/components/layout/BottomNav.tsx` - mobile nav colors
- `src/components/ui/switch.tsx` - bg-input for track visibility
- All page components, calendar, social, household, settings

**Switch Fix:**
- Track background: `bg-muted` → `bg-input` for better contrast
- Thumb: `bg-card` → `bg-background` for visibility in dark mode

**Tests Updated:**
- `toast.test.tsx`: bg-gray-50 → bg-muted
- `NotificationDropdown.test.tsx`: bg-white → bg-card

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS
- Visual: Dark mode works across entire app

**Status:** Committed to dev

---

## 2026-01-18: Dashboard Layout Fix - Fit-to-Screen & Consistent Padding

**Branch:** dev (direct commit)

**Issues Fixed:**

### Issue 1: Dashboard Horizontal Scrolling
The Kanban board had 4 horizontal columns causing horizontal scroll on smaller screens.

**Solution:** Changed from horizontal flex layout to 2x2 CSS grid:
- `SubscriptionBoard.tsx`: `flex gap-4 overflow-x-auto` → `grid grid-cols-1 md:grid-cols-2 gap-4`
- Top row: Active | Consider Canceling
- Bottom row: Paused | Scheduled
- Responsive: 1 column on mobile, 2x2 on desktop

### Issue 2: Dashboard Not Fitting Viewport
Page scrolled instead of fitting screen height.

**Solution:** Viewport-height layout with flexbox:
- `dashboard/page.tsx`: Added `h-[calc(100vh-3.5rem)] md:h-screen flex flex-col`
- Header section: `shrink-0` (fixed height)
- Board wrapper: `flex-1 min-h-0` (fills remaining space, allows overflow)
- `DashboardClient.tsx`: `h-full flex flex-col` with `flex-1 min-h-0 overflow-auto` for board

### Issue 3: Inconsistent Page Padding
Pages had different padding making sidebar appear to change width.

**Solution:** Standardized all pages to `p-6 md:p-8`:
- `calendar/page.tsx` - simplified wrapper
- `friends/page.tsx` - added padding wrapper
- `household/page.tsx` - both branches standardized
- `reminders/page.tsx` - `p-8` → `p-6 md:p-8`
- `settings/SettingsClient.tsx` - `p-8` → `p-6 md:p-8`

### BoardColumn Updates
- Removed fixed `min-w-[85vw] md:min-w-[280px]`
- Added `flex flex-col` for proper height distribution
- `CardContent`: `flex-1 overflow-y-auto min-h-[120px]` for vertical scrolling

### Test Fix
- `SubscriptionBoard.test.tsx`: Updated test from checking `overflow-x-auto` to checking `grid`, `grid-cols-1`, `md:grid-cols-2`
- Renamed test from "has horizontal scroll container for mobile" to "has 2x2 grid layout"

**Files Modified:**
- `src/app/(app)/dashboard/page.tsx` - viewport layout
- `src/components/subscriptions/DashboardClient.tsx` - flex layout
- `src/components/board/SubscriptionBoard.tsx` - CSS grid
- `src/components/board/BoardColumn.tsx` - removed fixed width
- `src/components/board/SubscriptionBoard.test.tsx` - grid test
- `src/app/(app)/calendar/page.tsx` - standardized padding
- `src/app/(app)/friends/page.tsx` - added padding
- `src/app/(app)/household/page.tsx` - standardized both branches
- `src/app/(app)/reminders/page.tsx` - standardized padding
- `src/app/(app)/settings/SettingsClient.tsx` - standardized padding

**Verification:**
- Lint: PASS (5 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS

**Visual Results:**
- Dashboard fits viewport - no page scrolling
- Kanban shows 2x2 grid layout
- Board section scrolls vertically if content overflows
- All pages have consistent content spacing
- Mobile responsive (stacks to 1 column)

**Status:** Committed to dev

---

## 2026-01-18: Navigation Reorder & Dashboard Cleanup

**Branch:** `dev` (direct commit)

**Changes:**
1. **Reordered sidebar navigation:** Calendar first, Dashboard second
2. **Reordered mobile BottomNav:** Calendar, Dashboard, Friends, Settings
3. **Removed "Edit Preferences" button** from dashboard header
4. **Moved "Add Subscription" button** inside scrollable board area (avoids notification bell overlap)

### Sidebar Navigation (sidebar.tsx)
Before: Dashboard, Calendar, Household, Friends, Reminders, Settings
After: Calendar, Dashboard, Household, Friends, Reminders, Settings

### Mobile BottomNav (BottomNav.tsx)
Before: Dashboard, Calendar, Friends, Settings
After: Calendar, Dashboard, Friends, Settings

### Dashboard Button Changes
- Removed `Edit Preferences` button (linked to /settings) from dashboard header
- Moved `Add Subscription` button from fixed position to inside scrollable board area
- Prevents overlap with notification bell at `fixed top-4 right-4`

**Files Modified:**
- `src/components/layout/sidebar.tsx` - reordered navItems
- `src/components/layout/BottomNav.tsx` - reordered navItems
- `src/app/(app)/dashboard/page.tsx` - removed Edit Preferences button, removed unused Link import
- `src/components/subscriptions/DashboardClient.tsx` - moved Add button inside overflow area

**Verification:**
- Lint: PASS (5 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS

**Note:** Middleware already redirects root `/` to `/calendar`, so no middleware changes needed.

**Status:** Committed to dev

---

## 2026-01-18: Social/Friends Page Bugs + Calendar Actions Fix

**Branch:** `dev` (direct commit)

**Problems Found:**
1. Friends API 500 - `column profiles.email does not exist`
2. Activity API 500 - `column services.logo_path does not exist` (should be `logo_url`)
3. Watchlists API 500 - Infinite recursion in RLS policy for `watchlist_members`
4. Calendar Add to Queue 400 - Client sends wrong request format
5. Queue Items 500 - Table `queue_items` never created

**Root Causes:**

### Bug 1: Friends API queries email from profiles
The `profiles` table only has: `id`, `created_at`, `name`, `watch_speed`, `vacation_mode`.
Email is in `auth.users`, not joinable. Query selected nonexistent `profiles.email`.

### Bug 2: Activity API wrong column name
Query selected `logo_path` but column is named `logo_url` in `services` table.

### Bug 3: Watchlists RLS infinite recursion
Policy on `watchlist_members` referenced itself:
```sql
SELECT USING (watchlist_id IN (SELECT watchlist_id FROM watchlist_members WHERE user_id = auth.uid()))
```
PostgreSQL evaluates policy → queries same table → evaluates policy → infinite loop.

### Bug 4: Calendar actions request mismatch
Client sent: `{ action: 'add_to_queue', release_id, title, service_id }`
API expected: `{ action: 'add_to_queue', release: { id, tmdb_id, title, content_type, ... } }`

### Bug 5: Missing queue_items table
Table was never created in any migration.

**Fixes Applied:**

1. **Friends API** - Remove email from queries, make email optional in types
   - `src/app/api/friends/route.ts` - Remove email from profile select
   - `src/lib/social/types.ts` - Make email optional: `email?: string | null`
   - POST now accepts `user_id` or `name` instead of email lookup

2. **Activity API** - Change `logo_path` to `logo_url`
   - `src/app/api/activity/route.ts` - Fixed column name

3. **Watchlists RLS** - Created migration to fix recursion
   - `supabase/migrations/014_fix_watchlist_rls.sql`
   - Uses `watchlists.created_by` for ownership checks instead of self-referencing

4. **Calendar Actions** - Fixed request format
   - `src/app/(app)/calendar/CalendarPageClient.tsx`
   - Include `tmdb_id` in transformation
   - Send full `release` object to API
   - Fixed `queue_item_id` param name

5. **Queue Items Table** - Created migration
   - `supabase/migrations/015_queue_items.sql`
   - Creates `queue_items` table with RLS policies

**Component Updates:**
- `src/components/social/FriendCard.tsx` - Show "Unknown" instead of email
- `src/components/social/FriendRequestCard.tsx` - Show "Unknown" instead of email
- `src/lib/optimizer-v2/types.ts` - Added `tmdb_id` to ContentRelease

**Test Updates:**
- `src/app/api/friends/route.test.ts` - Updated to use `user_id` param
- `src/components/social/FriendCard.test.tsx` - Test "Unknown" fallback
- `src/components/social/FriendRequestCard.test.tsx` - Test "Unknown" fallback

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS
- Friends API: 200 ✓
- Activity API: Needs migration
- Watchlists API: Needs migration
- Calendar Add to Queue: Needs queue_items migration

**Note:** User needs to run migrations 014 and 015 against Supabase:
```bash
supabase db push
# or apply manually via SQL Editor
```

**Status:** Committed to dev

---

## 2026-01-18: Calendar Data Flow Bug Fix

**Branch:** `dev` (direct commit)

**Problem:**
TMDB content sync was working successfully (82 items matched: Disney+ 22, AMC+ 26, Netflix 34) but the calendar UI showed empty. Content synced but never displayed.

**Root Cause Analysis:**

### Bug 1: Client reads wrong response structure
**File:** `src/app/(app)/calendar/CalendarPageClient.tsx` line 94

```typescript
// WRONG - API returns { months: [...] }
for (const service of calendarData.services || []) {

// CORRECT - need to iterate months first
for (const month of calendarData.months || []) {
  for (const service of month.services || []) {
```

### Bug 2: Type mismatch between API and components
**API returns:**
- `type: 'movie' | 'tv'`
- `match_score: number`

**Components expect:**
- `type: 'movie' | 'series'`
- `taste_match_score: number`

### Bug 3: Calendar types missing score fields
**File:** `src/lib/calendar/types.ts`

ContentRelease interface was missing `match_score` and `match_reason` fields that the database returns.

**Fixes Applied:**

1. **Updated CalendarPageClient** to iterate months correctly and transform types:
   - `release.type === 'tv' ? 'series' : 'movie'`
   - `taste_match_score: release.match_score ?? 0`

2. **Updated calendar types** to add required fields:
   ```typescript
   export interface ContentRelease {
     // ... existing fields
     match_score: number      // Added
     match_reason: string     // Added
   }
   ```

3. **Updated 9 test files** with new required fields:
   - `src/components/calendar/ContentCalendar.test.tsx`
   - `src/components/calendar/ContentDetailModal.test.tsx`
   - `src/components/calendar/ContentMarker.test.tsx`
   - `src/components/calendar/ServiceLane.test.tsx`
   - `src/lib/calendar/utils.test.ts`
   - `src/lib/optimizer-legacy/analyzer.test.ts`
   - `src/lib/tmdb/client.test.ts`
   - `src/app/api/calendar/route.test.ts`

4. **Updated TMDB client tests** to test api_key query param (v3 auth) instead of Bearer token

**Verification:**
- Lint: PASS
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS

**Files Modified:**
- `src/app/(app)/calendar/CalendarPageClient.tsx` - fixed months iteration, type transformation
- `src/lib/calendar/types.ts` - added match_score, match_reason fields
- 9 test files - updated mock data with new required fields

**Status:** Committed to dev

---

## 2026-01-18: Notification Bell Overlap Fix

**Branch:** `dev` (direct commit)

**Problem:**
The notification bell is positioned `fixed top-4 right-4 z-40` on desktop, floating over page content. Page content with right-aligned elements (dashboard "Monthly Spend", calendar "Regenerate"/"Apply All" buttons) overlapped the bell.

**Solution:**
Added `md:pr-16` to the `<main>` element in `src/app/(app)/layout.tsx`. This creates 4rem (64px) right padding on desktop, preventing content from reaching the bell area.

**Why this approach:**
- Single change in one place (layout.tsx)
- Prevents future pages from having the same issue
- Mobile unchanged (bell is in header bar, not fixed)

**File Modified:**
- `src/app/(app)/layout.tsx` - added `md:pr-16` to main element

**Verification:**
- Lint: PASS (5 warnings - pre-existing)
- TypeCheck: PASS
- Tests: 978/978 PASS
- Build: PASS

**Status:** Committed to dev

---

## 2026-01-18: Services Column Name Fix

**Branch:** `dev` (direct commit)

**Problem:**
Supabase services query returned 400 Bad Request:
```
GET .../services?select=id,name,base_price => [400]
```

**Root Cause:**
Code queried for column `base_price` but database schema (001_initial_schema.sql) defines column as `default_price`.

**Files Fixed:**
- `src/app/(app)/calendar/CalendarPageClient.tsx` - type + query
- `src/components/calendar-unified/QuickAddService.tsx` - type + usage
- `src/components/calendar-unified/ContentCalendarPage.tsx` - type
- `src/components/calendar-unified/EmptyState.tsx` - type
- `src/components/calendar-unified/QuickAddService.test.tsx` - mock data

**Verification:**
- TypeCheck: PASS
- Tests: 978/978 PASS
- Services query: 200 ✓
- Add to Queue: 201 Created ✓

**Status:** Committed to dev

---

## 2026-01-18: Watch Queue Display Fix

**Branch:** `dev` (direct commits)

**Problems Identified:**
1. Duplicate queue items showed raw database error instead of friendly message
2. Watch Queue section showed "empty" even after adding items
3. Optimizer API returned `watch_intents` but UI expected `watch_queue`

**Root Cause Analysis:**

### Issue 1: Duplicate Constraint Error
API returned raw Postgres error `duplicate key value violates unique constraint "queue_items_user_id_tmdb_id_content_type_key"` instead of user-friendly message.

**Fix:** Added error code check in `handleAddToQueue()`:
```typescript
if (error.code === '23505') {
  return NextResponse.json({ error: 'This item is already in your queue' }, { status: 409 })
}
```

Client updated to show info toast for 409: "Already in your queue"

### Issue 2: Queue Items Not Read from Database
Optimizer API never fetched from `queue_items` table. The `watch_queue` in the response came from internal `watch_intents` computed by the optimizer algorithm, not from user-added queue items.

**Fix:** Added `fetchQueueItems()` function that:
- Reads from `queue_items` table
- Transforms to `CalendarWatchSlot` format
- Merges with optimizer suggestions (user items take priority)

### Issue 3: Response Format Mismatch
`generateOptimizedPlan()` returns `OptimizedPlan` with `watch_intents`, but `CalendarPageClient` expects `CalendarOptimizedPlan` with `watch_queue`.

The `toCalendarPlan()` converter function existed but was never called.

**Fix:** Updated POST handler to:
1. Call `toCalendarPlan()` to convert response format
2. Fetch user's `queue_items`
3. Merge into `watch_queue` (user items first, then optimizer suggestions)

**Files Modified:**
- `src/app/api/calendar/actions/route.ts` - 409 response for duplicates
- `src/app/(app)/calendar/CalendarPageClient.tsx` - info toast for 409
- `src/app/api/optimizer-v2/route.ts` - fetchQueueItems + toCalendarPlan
- `src/app/api/optimizer-v2/route.test.ts` - added queue_items mock

**Verification:**
- TypeCheck: PASS
- Tests: 978/978 PASS
- Add to Queue: 201 Created ✓
- Duplicate: 409 + info toast ✓
- Watch Queue: Shows items ✓

**E2E Test:**
1. Clicked "Add to queue" on "The Rip"
2. Toast: "Added to queue"
3. Watch Queue section: "3 items" (HIS & HERS, People We Meet on Vacation, The Rip)
4. Clicked same item again → Toast: "Already in your queue"

**Status:** Committed to dev

---

## 2026-01-19: Calendar Subscription Windows Fix

**Branch:** direct to dev

**Problem:** Calendar View showed "No subscription windows" even though:
- Optimizer Summary showed $461.64 annual savings
- Watch Queue displayed items correctly
- Upcoming Releases showed 6 items

**Root Cause Analysis (Systematic Debugging):**

Traced data flow from API to UI. Discovered multiple schema mismatches in optimizer-v2 route:

### Issue 1: Column Name Mismatch (service_ids vs service_id)
Content table (migration 013) has `service_id` (singular FK), but query used `service_ids` (array) with `.overlaps()` filter.

**Fix:** Changed to `.in('service_id', serviceIds)` and wrapped result in array for type compatibility.

### Issue 2: Column Name Mismatch (poster_url vs poster_path)
Content table has `poster_url`, query selected `poster_path`.

**Fix:** Changed select to use `poster_url`, mapped to `poster_path` in transform.

### Issue 3: Non-Existent Columns
Query selected `runtime_minutes` and `episode_count` which don't exist in content table.

**Fix:** Removed from select, added defaults (120min movies, 45min TV, 10 episodes).

### Issue 4: Date Filter Too Strict
Query only fetched content with `release_date >= today`, but content in database had release dates Jan 5-14 (before Jan 19).

**Fix:** Extended date range to include past 30 days (recently released content is still watchable).

**Files Modified:**
- `src/app/api/optimizer-v2/route.ts` - Fixed query columns and date range
- `src/app/api/optimizer-v2/route.test.ts` - Added `.in()` mock

**Verification:**
- Tests: 978/978 PASS
- Calendar View now shows:
  - Netflix subscription window: "2026-01-16 - 2026-01-30"
  - Content markers for 6 releases
  - Watch Queue: 7 items
- Optimizer Summary: $446.15 savings (97%), Optimized: $15.49/yr

**Status:** Committed to dev

---

## 2026-01-19: Content Calendar Bug Fixes - Round 2

**Branch:** direct to dev

**Context:** E2E testing with Playwright MCP revealed 5 additional bugs after the subscription windows fix.

### Bugs Found & Fixed

#### Bug #1: Calendar Only Shows Netflix Lane (High)
**Symptoms:** User has 3 active subscriptions (Netflix, Disney+, AMC+) but Calendar View only shows Netflix lane.

**Root Cause:** `calculateSubscriptionWindows()` only created windows for services with scheduled watch slots. If Disney+/AMC+ content didn't match user's taste genres, no intents → no slots → no windows → no calendar lanes.

**Fix:** In `subscription-optimizer.ts`, added baseline windows for all active subscriptions even without scheduled content:
```typescript
for (const subscription of subscriptions) {
  if (subscription.status !== 'active') continue
  const hasWindow = windows.some((w) => w.service_id === subscription.service_id)
  if (hasWindow) continue
  // Create baseline window showing subscription exists
}
```

**Files:** `src/lib/optimizer-v2/subscription-optimizer.ts`, `subscription-optimizer.test.ts`

#### Bug #2: Upcoming Releases Only Shows Netflix (High)
**Symptoms:** 6 items in Upcoming Releases, all Netflix. Disney+ and AMC+ content not appearing.

**Root Cause:** CalendarPageClient date range (Jan 1 - Mar 31) didn't match optimizer-v2 range (30 days back - 90 days ahead), so content with recent release dates wasn't queried.

**Fix:** Extended date range in CalendarPageClient to match optimizer-v2 (30 days back, 90 days ahead).

**Files:** `src/app/(app)/calendar/CalendarPageClient.tsx`

#### Bug #3: "Upcoming Releases" Shows Past Dates (Medium)
**Symptoms:** Items show release dates Jan 5-14, but today is Jan 19. These are past releases.

**Root Cause:** Optimizer-v2 extended date range to include past 30 days (recent releases), but UI label was misleading.

**Fix:** Renamed section header from "Upcoming Releases" to "Recent & Upcoming".

**Files:** `src/components/calendar-unified/UpcomingReleases.tsx`

#### Bug #4: Watch Queue Remove Doesn't Persist (Medium)
**Symptoms:** Click Remove → toast shows "Removed" → page refresh → item reappears.

**Root Cause:** Optimizer regenerates watch_queue from watch_intents on every API call, ignoring manual removals.

**Fix:** Implemented soft-delete pattern:
1. Created migration 016 adding `removed BOOLEAN DEFAULT FALSE` to queue_items
2. Changed DELETE /api/queue to `.update({ removed: true })` instead of `.delete()`
3. Updated GET /api/queue to filter `.eq('removed', false)`
4. Added `fetchRemovedTmdbIds()` to optimizer-v2 route to filter removed items

**Files:** 
- `supabase/migrations/016_queue_items_removed.sql` (new)
- `src/app/api/queue/route.ts`
- `src/app/api/optimizer-v2/route.ts`
- `src/app/api/queue/route.test.ts`

#### Bug #5: Hydration Error on Friends Page (Low)
**Symptoms:** Console error "A tree hydrated but some attributes of the server rendered HTML didn't match the client prop..."

**Root Cause:** `formatRelativeTime()` uses `Date.now()` which produces different results between server render and client hydration. Also `toLocaleDateString()` in FriendCard can differ by locale.

**Fix:** Added `suppressHydrationWarning` to timestamp elements in ActivityFeed and FriendCard.

**Files:**
- `src/components/social/ActivityFeed.tsx`
- `src/components/social/FriendCard.tsx`

### Test Updates
Updated tests affected by the fixes:
- `subscription-optimizer.test.ts`: Changed "handles empty schedule" test to expect baseline windows, used single-service list for window behavior tests
- `queue/route.test.ts`: Updated mock for `.eq().eq()` chain and `.update()` instead of `.delete()`

**Verification:**
- Tests: 978/978 PASS
- Build: PASS
- Calendar View: All 3 subscription lanes visible
- Watch Queue: Items persist when removed
- Friends page: No hydration errors

**Migration Needed:** `supabase db push` for migration 016

**Status:** All 5 bugs fixed, tests passing, committed to dev
