# AI Plan

Source of truth for all work. No feature branch may exist without a section here.

---

## Required Files

| File | Audience | Purpose |
|------|----------|---------|
| `CLAUDE.md` | AI | Auto-loaded on session start; points to AI_PLAN.md |
| `README.md` | Humans | Project overview, how to run/test, high-level TODO |
| `AI_PLAN.md` | AI | Workflow rules, skills, branch sections, task details |
| `AI_SCRATCHPAD.md` | Both | Append-only audit trail of completed work |

---

## Workflow (Required Skills)

This project uses the **superpowers** skill system. Skills are mandatory, not optional.

### Skill Invocation Rules
1. Check for applicable skills **before any action** (even clarifying questions)
2. If there's even a 1% chance a skill applies, invoke it
3. Process skills (brainstorming, debugging) come before implementation skills

### Phase → Skill Map

| Phase | Skill | When |
|-------|-------|------|
| **Start** | `using-superpowers` | Every task, first thing |
| **Design** | `brainstorming` | New features, unclear requirements |
| **Planning** | `writing-plans` | Before any implementation (writes to this file) |
| **Branch Setup** | `using-git-worktrees` | When creating feature branches |
| **Execution** | `subagent-driven-development` | Same-session parallel work |
| **Execution** | `executing-plans` | Separate-session with human checkpoints |
| **Parallel** | `dispatching-parallel-agents` | Independent tasks that can run concurrently |
| **Coding** | `test-driven-development` | **Always** - no code without failing test first |
| **Debugging** | `systematic-debugging` | Any bug, test failure, or unexpected behavior |
| **Pre-completion** | `verification-before-completion` | Before claiming any work is done |
| **Branch Done** | `finishing-a-development-branch` | Ready to merge |
| **Review** | `requesting-code-review` | After major implementations |
| **Review** | `receiving-code-review` | When processing feedback |
| **UX Review** | `ux-flow-analysis` | UX audits, flow analysis, friction identification |

### Testing Requirements
- **Unit tests:** Strict TDD (RED → GREEN → REFACTOR)
- **E2E tests:** Verification gate before merge. Use MCP Playwright tools (`browser_navigate`, `browser_snapshot`, `browser_click`, etc.) to navigate the app, inspect/critique the UI, compare against other UIs for inspiration, and validate critical user-facing flows. Feel free to test E2E without MCP, it is not required if it doesn't make sense.
- **UX Analysis:** Use the `ux-flow-analysis` skill (global at `~/.claude/skills/ux-flow-analysis/`) for comprehensive UX audits. This skill provides systematic user journey tracing, friction scoring, cognitive load assessment, and emotional journey mapping.  

### Token Optimization
| Task Type | Strategy |
|-----------|----------|
| Exploration/search | `Explore` subagent |
| Simple mechanical tasks | `model: "haiku"` |
| Implementation | Fresh agent per task |
| Complex reasoning/planning | Full context (Sonnet/Opus) |

### Parallel Work Patterns
- **Pattern A (multiple branches):** Independent features → separate `feature/*` branches via worktrees
- **Pattern B (single branch):** One feature with sub-tasks → declare file ownership below, no overlap allowed

### Abandoned Branches
If a branch is abandoned (wrong approach, blocked, etc.):
1. Delete the branch
2. Log in AI_SCRATCHPAD.md: date, branch name, reason for abandonment, any lessons learned

### Project Setup
First feature branch should include `.gitignore` for the tech stack (e.g., `node_modules/`, `.env`, etc.).

---

## Branch Map

| Branch | Status | Description |
|--------|--------|-------------|
| `main` | active | Branch of truth |
| `dev` | active | Integration branch |

**Status values:** `active` (permanent branches), `in-progress`, `blocked`, `abandoned`

**Note:** Remove merged/abandoned branches from this table after archiving. History lives in Archive section.

---

## Phases 7-14 Roadmap

**Status:** Phases 1-13 complete (720 tests). All planned phases done.

### Overview

| Phase | Feature | Depends On | Execution |
|-------|---------|------------|-----------|
| 7a | Editable Taste Profile | - | Sequential (first) |
| 7b | Account Linking (Email Detection) | 7a | Sequential (after 7a) |
| 8 | Kanban Board View | - | Wave 2 (parallel with 9) |
| 9 | Content Calendar | - | Wave 2 (parallel with 8) |
| 10 | Subscription Optimizer | 7a, 9 | Wave 3 (sequential) |
| 11 | Binge Planner | 10 | Wave 3 (sequential) |
| 12 | Smart Notifications | 10, 11 | Wave 3 (sequential) |
| 13a | Household Mode | 10 | Wave 4 (parallel with 13b) |
| 13b | Social/Friends | 10 | Wave 4 (parallel with 13a) |
| ~~14~~ | ~~Deal Tracker~~ | - | **SKIPPED** |

### Execution Waves

**Wave 1 (Sequential):** 7a → 7b (Settings infrastructure)
**Wave 2 (Parallel):** 8 + 9 (New views: Kanban, Calendar)
**Wave 3 (Sequential):** 10 → 11 → 12 (Core intelligence)
**Wave 4 (Parallel):** 13a + 13b (Social features)

### Key Decisions
- Phase 7b: Build fully (OAuth verification is deployment concern)
- Wave 1: Sequential to avoid Settings page conflicts
- Test targets: Guidelines, not hard requirements
- Phase 14: Skipped for now

### Full Specifications
See `docs/PHASES_7-14_PLAN.md` for complete task lists, file ownership, and database migrations.

---

## Branch Template

> Copy this template when creating a new feature branch section. Do not edit the template itself.

```markdown
## Branch: feature/<slug>

### Goal
[What this branch accomplishes. If modifying existing functionality, reference the original feature.]

### Scope
**Included:**
- ...

**Excluded:**
- ...

### Tasks
- [ ] Task 1
- [ ] Task 2

### Files
| File | Owner |
|------|-------|
| `path/to/file` | Agent-1 |

### Verification
\`\`\`bash
# Commands to verify this branch
\`\`\`

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass
- [ ] E2E verification passes (or N/A justified)
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive
```

---

## Archive

Merged branch sections are moved here for reference. To edit a feature, create a new branch and reference the archived section.

**Archive format:**
```
### <branch-name> (merged YYYY-MM-DD)
**Goal:** <one-line summary>
**Files:** <key files changed>
**Summary:** <brief description of what was done>
```

### feature/phase-1-foundation (merged 2026-01-09)
**Goal:** Initialize SubCycle with Next.js, Supabase auth, database schema, and UI shell
**Files:** app/(auth)/*, app/(app)/*, lib/supabase/*, middleware.ts, supabase/migrations/*, components/ui/*, components/layout/*
**Summary:** Set up project foundation with Next.js 16 + Tailwind + shadcn/ui, Supabase auth (login/signup), 6-table database schema with RLS, 15 streaming services seeded, sidebar navigation, route protection middleware, and 10 component tests.

### feature/phase-2-onboarding (merged 2026-01-10)
**Goal:** 3-step onboarding flow for new users
**Files:** components/onboarding/*, app/(app)/onboarding/page.tsx, app/api/onboarding/complete/route.ts, app/(app)/layout.tsx, middleware.ts
**Summary:** Built WelcomeStep, ServiceSelector, and TasteQuiz components. Created 3-step onboarding page with progress indicator. API endpoint saves subscriptions and taste profile. Layout redirects new users to onboarding. 31 new tests (41 total).

### feature/phase-3-dashboard (merged 2026-01-10)
**Goal:** Subscription dashboard with status management
**Files:** components/subscriptions/*, app/(app)/dashboard/page.tsx, app/api/subscriptions/route.ts, app/api/subscriptions/[id]/route.ts
**Summary:** Built StatusBadge, SubscriptionCard, SubscriptionList, AddSubscriptionModal, and DashboardClient components. CRUD API endpoints for subscriptions. Dashboard shows monthly spend, allows add/pause/resume actions. 26 new tests (67 total across codebase).

### feature/phase-4-content (merged 2026-01-10)
**Goal:** TMDB content intelligence with taste matching
**Files:** lib/tmdb/*, lib/types/content.ts, app/api/content/*
**Summary:** Built TMDB client with auth, response types, and genre/provider mappings. Matching algorithm scores content: +20 per genre overlap (max 60), +40 for favorite show title match (capped at 100). /api/content/sync fetches and caches content (24hr TTL), /api/content/matches returns scored content per service. 20 new tests (87 total).

### feature/phase-5-recommendations (merged 2026-01-10)
**Goal:** Claude-powered AI recommendations with UI
**Files:** lib/claude/*, components/recommendations/*, app/(app)/recommendations/page.tsx, app/api/recommendations/route.ts, components/ui/toast.tsx
**Summary:** Built Claude client with auth and prompt templates. RecommendationBadge (keep=green, pause=amber, consider=gray), RecommendationCard with verdict/matches/reason/actions, RecommendationsSummary with savings display. /recommendations page with loading/empty states. Toast notification system. SubscriptionCard updated with badge slot. Sidebar navigation updated. 48 new tests (135 total).

### feature/phase-6-reminders-polish (merged 2026-01-11)
**Goal:** Complete reminders feature, service logos, user name collection, and polish
**Files:** lib/types/reminder.ts, app/api/reminders/*, components/reminders/*, components/subscriptions/*, components/onboarding/WelcomeStep.tsx, app/(app)/dashboard/page.tsx, public/logos/*.svg, components/ui/skeleton.tsx, components/ui/error-banner.tsx, components/layout/sidebar.tsx
**Summary:** Built reminders CRUD with calendar view (SetReminderModal, ReminderCalendar, ReminderDetails, RemindersClient). Added user name collection in onboarding with dashboard greeting. Created 15 service logo SVGs. Added skeleton loaders and error banners. Made sidebar mobile responsive with hamburger menu and drawer. Responsive grids (3→2→1 cols), touch-friendly calendar, hover animations. E2E verified with Playwright. 65 new tests (200 total).

### feature/phase-7a-editable-taste (merged 2026-01-12)
**Goal:** Allow users to edit taste profile (genres, favorite shows) from Settings page
**Files:** app/(app)/settings/page.tsx, components/settings/TasteProfileEditor.tsx, app/api/taste-profile/route.ts, lib/constants.ts, lib/errors.ts, components/layout/sidebar.tsx, app/(app)/dashboard/page.tsx, components/onboarding/TasteQuiz.tsx, app/api/recommendations/route.ts
**Summary:** Built Settings page with TasteProfileEditor component. Genre chips (toggle on/off) and comma-separated favorite shows input. GET/PATCH /api/taste-profile API with cache invalidation. Extracted GENRES to shared constants, created ApiError/errorResponse helpers. Added Settings link to sidebar and "Edit Preferences" button to dashboard. E2E verified with Playwright. 17 new tests (217 total).

### feature/phase-7b-account-linking (merged 2026-01-12)
**Goal:** Email-based subscription detection via Gmail integration
**Files:** supabase/migrations/004_user_emails.sql, lib/email/*, app/api/auth/gmail/route.ts, app/api/subscriptions/detect/route.ts, components/settings/EmailAccountsManager.tsx, components/settings/SubscriptionDetector.tsx, app/(app)/settings/SettingsClient.tsx
**Summary:** Built user_emails table with RLS. Email detection library with patterns for 15 services, GmailClient with mock mode. GET/POST/DELETE /api/auth/gmail for account management, POST /api/subscriptions/detect for scanning. Settings page now tabbed (Profile | Connected Accounts). EmailAccountsManager and SubscriptionDetector components. 58 new tests (275 total).

### feature/phase-8-kanban-board (merged 2026-01-12)
**Goal:** Drag-and-drop Kanban board view for subscription management
**Files:** supabase/migrations/005_board_column.sql, components/board/*, app/api/subscriptions/[id]/route.ts, components/subscriptions/DashboardClient.tsx, components/subscriptions/types.ts
**Summary:** Added board_column enum to subscriptions table. Built BoardColumn (droppable with cost total), DraggableCard (wraps SubscriptionCard), and SubscriptionBoard (4 columns: Active, Consider Canceling, Paused, Scheduled) using @dnd-kit. Optimistic updates with API error revert. Updated PATCH endpoint and dashboard. 21 new tests (296 total).

### feature/phase-9-content-calendar (merged 2026-01-12)
**Goal:** Timeline view of upcoming content releases across subscribed services
**Files:** lib/calendar/*, app/api/calendar/route.ts, components/calendar/*, app/(app)/calendar/page.tsx, components/layout/sidebar.tsx
**Summary:** Built calendar types and utils (date range, grouping, positioning). GET /api/calendar returns releases grouped by month and service. ContentMarker (positioned dots), ServiceLane (timeline per service), ContentDetailModal (with Set Reminder), ContentCalendar (month navigation + swim lanes). Added Calendar link to sidebar. 52 new tests (349 total).

### Phase 10 - Subscription Optimizer (merged 2026-01-12)
**Goal:** AI-powered 12-month subscription optimization schedule
**Files:** lib/optimizer/*, app/api/optimizer/*, components/optimizer/*, app/(app)/optimizer/page.tsx, components/layout/sidebar.tsx
**Summary:** Built optimizer library (types, savings calculator, analyzer, prompt builder). Claude API generates optimal subscribe/cancel schedule. SavingsSummary, OptimizedTimeline, MonthlyBreakdown, OptimizerClient components. /optimizer page with generate/apply flow. Creates reminders and updates board columns. 56 new tests (405 total).

### Phase 11 - Binge Planner (merged 2026-01-12)
**Goal:** Calculate optimal subscribe/cancel dates for binge-watching shows
**Files:** supabase/migrations/006_add_watch_speed.sql, lib/tmdb/client.ts, lib/binge/*, app/api/binge/*, components/binge/*, app/(app)/binge/page.tsx, components/calendar/ContentDetailModal.tsx, components/calendar/ServiceLane.tsx, components/layout/sidebar.tsx
**Summary:** Added watch_speed column to profiles. Extended TMDB client with getShowDetails for episode data. Built binge calculator (duration, dates, cost). WatchSpeedSlider (1-6 eps/day), BingePlanCard (plan display), BingeClient (state management). /binge page with sidebar link. ContentDetailModal gets "Plan Binge" button for TV shows. 40 new tests (445 total).

### Phase 12 - Smart Notifications (merged 2026-01-13)
**Goal:** In-app notification center with auto-remind on subscription pause
**Files:** supabase/migrations/007_notifications.sql, lib/notifications/*, app/api/notifications/*, components/notifications/*, components/settings/NotificationPreferences.tsx, components/ui/switch.tsx, components/layout/sidebar.tsx, app/(app)/settings/SettingsClient.tsx, app/api/subscriptions/[id]/route.ts
**Summary:** Created notifications and notification_preferences tables with RLS. Built notification generator utilities (content_release, pause_suggestion, resubscribe_reminder, price_change types). NotificationBell with dropdown in sidebar (mobile + desktop), NotificationCard with icons and timestamps. NotificationPreferences in Settings with toggle switches. Auto-remind hook: when subscription moved to 'paused' board, creates resubscribe reminder and notification. 54 new tests (499 total).

### Phase 13a - Household Mode (merged 2026-01-14)
**Goal:** Multi-user household support with shared subscriptions and combined taste profiles
**Files:** supabase/migrations/008_households.sql, lib/household/*, app/api/household/*, components/household/*, app/(app)/household/page.tsx, components/layout/sidebar.tsx
**Summary:** Created households and household_members tables with RLS. Built invite code generation (8-char alphanumeric), taste profile aggregator (union of genres/shows). API routes for household CRUD, invite validation/join, member management. Components: HouseholdSetup (create/join forms), MemberCard, MembersList, InviteModal (copy code), HouseholdInsights (combined taste, monthly spend), HouseholdClient. /household page with sidebar link. ~105 new tests.

### Phase 13b - Social/Friends (merged 2026-01-14)
**Goal:** Friend connections, activity feeds, and shared watchlists
**Files:** supabase/migrations/009_social.sql, lib/social/*, app/api/friends/*, app/api/activity/*, app/api/watchlists/*, components/social/*, app/(app)/friends/page.tsx, components/layout/sidebar.tsx
**Summary:** Created friendships, activity_feed, watchlists, watchlist_members, watchlist_items tables with RLS. Friend request system (send/accept/decline). Activity feed showing friends' subscription changes. Shared watchlists with owner/editor/viewer roles. Components: FriendCard, FriendRequestCard, FriendsList, AddFriendModal, ActivityFeed, WatchlistCard, WatchlistDetail, SocialClient (tabbed). /friends page with sidebar link. ~116 new tests.

**Combined Phase 13:** 221 new tests (720 total).

### feature/direct-cancel (merged 2026-01-15)
**Goal:** Direct subscription cancellation via external service URLs
**Files:** components/subscriptions/CancelSubscriptionModal.tsx, components/subscriptions/SubscriptionCard.tsx, components/subscriptions/DashboardClient.tsx, components/board/SubscriptionBoard.tsx, components/board/BoardColumn.tsx, components/board/DraggableCard.tsx
**Summary:** Added CancelSubscriptionModal that opens service's cancel_url in new tab with optional mark-as-paused checkbox. Cancel button appears on subscription cards when cancel_url exists. Modal wired through DashboardClient and Kanban board component chain. 10 new tests (730 total).

### feature/ux-1-optimizer-brain (merged 2026-01-15)
**Goal:** Rebuild optimizer with deterministic priority scoring from all inputs (taste matches, watchlists, friend shares, binge plans)
**Files:** lib/optimizer-v2/*, app/api/optimizer-v2/route.ts, supabase/migrations/010_optimizer_plans.sql
**Summary:** Complete optimizer-v2 library with modular design: types, intent-builder (12 tests), time-calculator (9 tests), prioritizer (13 tests), scheduler (8 tests), subscription-optimizer (8 tests), action-generator (6 tests), optimizer (6 tests), recalculator (8 tests). Database caching with hash-based invalidation. 74 new tests (804 total).

### feature/ux-2-auto-pilot (merged 2026-01-15)
**Goal:** Automatic subscription management system - auto-pause, auto-remind, handle missed deadlines
**Files:** lib/auto-pilot/*, app/api/auto-pilot/execute/route.ts, app/api/optimizer-v2/apply/route.ts, supabase/migrations/011_auto_pilot.sql, vercel.json
**Summary:** Complete auto-pilot library: action-executor (8 tests), deadline-detector (6 tests), deadline-handler (6 tests), behavior-tracker (7 tests), notification-sender (5 tests). Execute cron route (4 tests), apply plan route (4 tests). Database tables for auto_actions and user_behavior_patterns. Vercel cron configured for daily 9 AM UTC execution. 40 new tests (844 total).

### feature/ux-3-unified-calendar (merged 2026-01-15)
**Goal:** Unified Content Calendar page with 4 sections (optimizer summary, watch queue, calendar view, upcoming releases)
**Files:** components/calendar-unified/OptimizerSummary.tsx, components/calendar-unified/WatchQueue.tsx, components/calendar-unified/CalendarView.tsx, components/calendar-unified/UpcomingReleases.tsx, components/calendar-unified/ReleaseDetailModal.tsx, components/calendar-unified/ContentCalendarPage.tsx, lib/optimizer-v2/types.ts
**Summary:** Built unified calendar hub with 4 integrated sections. OptimizerSummary (8 tests) shows savings and this-week actions. WatchQueue (8 tests) displays prioritized queue with friend badges. CalendarView (10 tests) shows service lanes with subscription windows. UpcomingReleases (8 tests) for content discovery. ReleaseDetailModal (6 tests) for details. ContentCalendarPage (6 tests) orchestrates all sections. Added Calendar-prefixed types. 46 new tests (890 total).

### feature/ux-4-one-tap-actions (merged 2026-01-15)
**Goal:** Queue API and one-tap action handlers for calendar interactions
**Files:** lib/queue/types.ts, app/api/queue/route.ts, app/api/queue/binge/route.ts, app/api/queue/watch-together/route.ts, app/api/queue/reorder/route.ts, app/api/calendar/actions/route.ts, lib/calendar-unified/action-handlers.ts, lib/calendar-unified/use-calendar-actions.ts, components/calendar-unified/DraggableQueueItem.tsx
**Summary:** Queue CRUD API (8 tests), binge planning API (4 tests), watch-together API (4 tests), calendar actions API (6 tests). Client action handlers (9 tests) wrap all endpoints. useCalendarActions hook (6 tests) with loading/error states. DraggableQueueItem (4 tests) with @dnd-kit sortable. 41 new tests (931 total).

### feature/ux-5-remove-old-pages (merged 2026-01-16)
**Goal:** Remove redundant pages merged into unified calendar, simplify navigation
**Files:** app/(app)/recommendations/page.tsx (deleted), app/(app)/optimizer/page.tsx (deleted), app/(app)/binge/page.tsx (deleted), components/recommendations/* (deleted), components/binge/* (deleted), lib/optimizer/* (moved to legacy), components/optimizer/* (moved to legacy), components/layout/sidebar.tsx, middleware.ts, next.config.ts
**Summary:** Removed 3 pages (recommendations, optimizer, binge), deleted 15 component files, moved 14 files to legacy folders. Sidebar reduced from 9 to 6 items: Dashboard, Content Calendar, Household, Friends, Reminders, Settings. Added permanent redirects for old URLs. Changed default redirect from /dashboard to /calendar. -52 tests (879 total).

### feature/ux-6-new-user-experience (merged 2026-01-17)
**Goal:** Brand new user understands app and sees value in 30 seconds through guided onboarding
**Files:** components/calendar-unified/EmptyState.tsx, components/calendar-unified/InlineTastePicker.tsx, components/calendar-unified/QuickAddService.tsx, components/calendar-unified/Tooltip.tsx, components/calendar-unified/FirstSavingsPopup.tsx, lib/calendar-unified/tooltips.ts, app/(app)/calendar/CalendarPageClient.tsx, components/calendar-unified/ContentCalendarPage.tsx
**Summary:** EmptyState (7 tests) with 3-step guided setup. InlineTastePicker (6 tests) for quick genre selection. QuickAddService (6 tests) for fast subscription addition. Tooltip (5 tests) for progressive disclosure. FirstSavingsPopup (4 tests) for celebration moment. ContentCalendarPage updated with empty state detection and data-tooltip attributes. CalendarPageClient handles data fetching. 28 new tests (907 total).

### feature/ux-7-edge-cases (merged 2026-01-17)
**Goal:** Edge case handling - content changes, price changes, user absence, overloaded queues, vacation mode
**Files:** lib/edge-cases/*, app/api/edge-cases/check/route.ts, app/api/vacation-mode/route.ts, components/settings/VacationMode.tsx, supabase/migrations/012_vacation_mode.sql, app/api/auto-pilot/execute/route.ts, components/calendar-unified/WatchQueue.tsx
**Summary:** Complete edge-cases library: content-monitor (6 tests), price-monitor (5 tests), activity-monitor (5 tests), vacation-mode (6 tests), queue-manager (5 tests). Edge cases check API route (5 tests). VacationMode settings component (5 tests). Auto-pilot skips users on vacation. WatchQueue shows queue health indicator. Database migration adds vacation columns to profiles, activity tracking to user_behavior_patterns, and service_price_history table. 43 new tests (950 total).

### feature/ux-8-social-integration (merged 2026-01-17)
**Goal:** Social integration - friend activity, watch together, spoiler alerts enhance calendar experience
**Files:** lib/social-integration/*, app/api/calendar/route.ts, lib/calendar/types.ts, lib/optimizer-v2/types.ts, components/calendar-unified/WatchQueue.tsx, components/calendar-unified/WatchTogetherModal.tsx, components/calendar-unified/ContentCalendarPage.tsx, lib/calendar-unified/action-handlers.ts, lib/calendar-unified/use-calendar-actions.ts
**Summary:** Complete social-integration library: friend-activity (5 tests), share-handler (4 tests), watch-together (4 tests), spoiler-alert (3 tests). Calendar API enriches releases with friend_watching flag. WatchQueue shows friend names ("Shared by Alice") and Watch Together button (2 tests). WatchTogetherModal for inviting friends (3 tests). ContentCalendarPage integrates modal with friend fetching. 22 new tests (972 total).

### feature/ux-9-polish (merged 2026-01-17)
**Goal:** Final UX polish - dark mode, confetti celebrations, mobile bottom navigation, haptic feedback, shimmer skeletons
**Files:** components/ui/confetti.tsx, components/ui/skeleton.tsx, components/settings/DarkModeToggle.tsx, components/layout/BottomNav.tsx, lib/haptics.ts, components/layout/sidebar.tsx, app/(app)/settings/SettingsClient.tsx, app/(app)/calendar/CalendarPageClient.tsx, components/board/DraggableCard.tsx, components/calendar-unified/DraggableQueueItem.tsx
**Summary:** DarkModeToggle (2 tests) with useSyncExternalStore and localStorage persistence. BottomNav (1 test) mobile navigation with 4 items. Confetti (1 test) celebration on Apply All. Haptics (1 test) vibration utility. Skeleton shimmer variant (1 test). Drag ghost scale(1.05) effect. Settings Appearance section. 6 new tests (978 total). UX Overhaul complete!

### dark-mode-fix (direct to dev, 2026-01-17)
**Goal:** Full dark mode support across entire app
**Files:** ~60 files updated - layout.tsx, sidebar.tsx, BottomNav.tsx, switch.tsx, all page components, calendar-unified/*, subscriptions/*, settings/*, social/*, household/*, notifications/*, reminders/*
**Summary:** Replaced hardcoded Tailwind colors (bg-gray-50, text-gray-900, etc.) with CSS variables (bg-background, text-foreground, text-muted-foreground, border-border, bg-muted, bg-accent, bg-card, bg-input). Fixed Switch component track/thumb visibility. Updated 2 tests. Dark mode now affects sidebar, content area, navigation, and all components. 978 tests passing.

### dashboard-layout-fix (direct to dev, 2026-01-18)
**Goal:** Dashboard fit-to-screen with 2x2 Kanban grid, consistent page padding
**Files:** dashboard/page.tsx, DashboardClient.tsx, SubscriptionBoard.tsx, BoardColumn.tsx, calendar/page.tsx, friends/page.tsx, household/page.tsx, reminders/page.tsx, settings/SettingsClient.tsx, SubscriptionBoard.test.tsx
**Summary:** Changed Kanban board from 4 horizontal columns with horizontal scroll to 2x2 CSS grid with vertical scroll. Dashboard page now fits viewport height using `h-[calc(100vh-3.5rem)] md:h-screen flex flex-col`. Standardized all page padding to `p-6 md:p-8` for consistent sidebar appearance. Updated test to check for grid classes instead of overflow-x-auto. 978 tests passing.

### nav-reorder-and-dashboard-cleanup (direct to dev, 2026-01-18)
**Goal:** Reorder navigation (Calendar first, Dashboard second), remove Edit Preferences button, reposition Add Subscription button
**Files:** sidebar.tsx, BottomNav.tsx, dashboard/page.tsx, DashboardClient.tsx
**Summary:** Reordered sidebar navItems: Calendar first, Dashboard second (rest unchanged). Reordered BottomNav: Calendar, Dashboard, Friends, Settings. Removed "Edit Preferences" button from dashboard header. Moved "Add Subscription" button inside scrollable board area to avoid notification bell overlap. 978 tests passing.

### notification-bell-overlap-fix (direct to dev, 2026-01-18)
**Goal:** Fix notification bell overlapping page content on desktop
**Files:** layout.tsx
**Summary:** Added `md:pr-16` to main element in app layout, creating 4rem right padding on desktop. This prevents page content from overlapping the fixed notification bell at `top-4 right-4`. Mobile unchanged (bell is in header bar). 978 tests passing.

### real-data-fix (direct to dev, 2026-01-18)
**Goal:** Fix TMDB content sync and calendar data flow so real content appears
**Files:** lib/tmdb/client.ts, lib/calendar/types.ts, lib/tmdb/matching.ts, CalendarPageClient.tsx, route.ts (calendar), route.ts (sync), supabase/migrations/013_fix_content_table.sql, 9 test files
**Summary:** Fixed TMDB client auth (changed from Bearer token to api_key query param for v3 API). Updated content table schema (added user_id, service_id as FK, match_score, match_reason, poster_url columns). Fixed calendar API response parsing (client was reading calendarData.services but API returns calendarData.months[].services[]). Added type transformation (tv→series, match_score→taste_match_score). Content now syncs successfully: 82 items matched across 3 services (Disney+ 22, AMC+ 26, Netflix 34). All 978 tests passing.

