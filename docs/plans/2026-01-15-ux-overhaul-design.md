# SubCycle UX Overhaul - Implementation Plan

## Goal
**"Open app → See exactly what to watch and when → Save money automatically"**

One page (Content Calendar). Zero thinking. Instagram-level simplicity.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File paths | Existing pattern (`lib/`, `components/`) | Match current codebase structure |
| Execution | Sequential branches | Safest, easiest to review |
| AI approach | Hybrid | Algorithmic core + Claude for complex decisions |
| Migrations | Start at 010 | Avoid conflicts with existing 001-009 |
| Old optimizer | Keep as fallback (`lib/optimizer-legacy/`) | Safety net for rollback |
| Data refresh | Optimistic + background sync | Best UX, revert on error |
| Legacy tests | Keep as `*.legacy.test.ts` | Maintain coverage for fallback |
| Default route | `/calendar` after login | "One page, zero thinking" goal |

---

## Design Decisions (Deep Dive)

### Optimizer-v2 Algorithm

**Priority Scoring (highest to lowest):**
1. **Deadline urgency** (+50 if ≤7 days, +30 if ≤14 days)
2. **Friend shares** (+40)
3. **Taste match score** (0-30 based on %)
4. **Explicit watchlist** (+10)
5. **Binge plans** (+10)
6. **Release recency** (+20 if ≤7 days)

**When Claude AI is used:**
- Only when algorithm detects conflicts (impossible schedules, competing deadlines)
- Algorithm suggests cuts first, Claude provides reasoning if additional help needed
- Claude never runs automatically - triggered by specific conflict conditions

**Overloaded Queue Handling:**
1. Algorithm flags overload with specific hours deficit
2. Shows which items to remove to make feasible
3. If user needs help deciding, Claude provides prioritization reasoning

### Unified Calendar UX

**Section Order (top to bottom):**
1. Optimizer Summary (most prominent, immediate value)
2. Watch Queue (action-oriented)
3. Calendar View (visual timeline)
4. Upcoming Releases (discovery)

**Section Sync:**
- All sections update together (optimistic)
- Action in one section immediately reflects in all others
- Background sync with rollback on error

**Mobile Layout:**
- Vertical stack (all 4 sections)
- Scroll vertically through them
- No tabs/carousel - keeps everything accessible

### Auto-Pilot System

**Missed Deadline Handling:**
- Send notification explaining the miss
- Auto-reschedule to next possible date
- Recalculate entire plan with new dates
- Track in behavior patterns for future reminder timing

**Cron Design:**
- User timezone aware (run at 9am in user's local time)
- Infer timezone from browser on login, store in profile
- Fall back to UTC if detection fails
- Stagger processing across timezone buckets

**Timezone Detection:**
- Detect via `Intl.DateTimeFormat().resolvedOptions().timeZone` on login
- Store in `profiles.timezone` column
- Update on each login if changed

### Migration Strategy

**Transition Approach:**
- Hard redirect from old URLs to /calendar
- No grace period or soft migration
- Legacy code kept as fallback but not exposed to users

**Rollback Trigger:**
- Manual only - team decides based on feedback/bugs
- Legacy optimizer available at `lib/optimizer-legacy/`
- Can revert middleware redirect to restore old flow

### Apply All Behavior

**Flow:**
1. User clicks "Apply All"
2. Show confirmation modal with all changes (reminders to create, subscriptions to move)
3. User confirms
4. Create cancel/resubscribe reminders
5. Move subscriptions to 'scheduled' board column
6. Show success toast

### Plan Regeneration

**Auto-regenerate on input changes:**
- Detect changes to: subscriptions, watchlist, friend shares, taste profile
- Hash inputs and compare to stored hash
- Regenerate in background if hash differs
- Show subtle "Plan updated" indicator (not intrusive)
- Store new plan in cache

### Technical Constraints

**External APIs:**
- TMDB only for content data
- Claude AI only for conflict resolution
- No new integrations (JustWatch, Trakt, etc.)

**Browser Support:**
- Modern browsers only (last 2 versions)
- Chrome, Safari, Firefox, Edge
- No IE11 support
- Mobile: iOS Safari, Chrome Android

### Testing Strategy

**Unit Tests:**
- TDD for all new lib/ modules
- Component tests for all UI components
- API route tests

**E2E Tests (Playwright via MCP):**
- Critical calendar flows:
  - Load calendar → see savings
  - Add to queue → see in queue
  - Apply plan → see confirmation → confirm
  - Drag-drop reschedule
- Run via `mcp__playwright__*` tools during verification

### Observability

**Basic logging:**
- Optimizer: generation time, cache hit/miss, input hash
- Auto-pilot: action execution, missed deadlines
- API routes: response times, error rates
- Format: structured JSON logs to console

---

## Phase Overview

| Phase | Feature | New Tests | Total Tests |
|-------|---------|-----------|-------------|
| UX-1 | Optimizer Brain | +62 | 792 |
| UX-2 | Auto-Pilot | +38 | 830 |
| UX-3 | Unified Content Calendar | +46 | 876 |
| UX-4 | One-Tap Actions | +40 | 916 |
| UX-5 | Remove Old Pages | -20 (keep legacy) | 896 |
| UX-6 | New User Experience | +17 | 913 |
| UX-7 | Edge Case Handling | +32 | 945 |
| UX-8 | Social Integration | +21 | 966 |
| UX-9 | Polish & Dark Mode | +6 | 972 |

---

## Execution Order

```
UX-1 → UX-2 → UX-3 → UX-4 → UX-5 → UX-6 → UX-7 → UX-8 → UX-9
```

Each phase: Create branch → Implement → Test → Merge to dev → Next phase

---

## Phase 1: UX-1 Optimizer Brain

### Branch: `feature/ux-1-optimizer-brain`

### Goal
Rebuild optimizer to make smart decisions from ALL inputs. Hybrid approach: deterministic algorithm for core logic, Claude AI for complex scheduling decisions and natural language explanations.

### Critical Files

| File | Purpose |
|------|---------|
| `lib/optimizer-v2/types.ts` | Core type definitions |
| `lib/optimizer-v2/intent-builder.ts` | Build watch intents from all sources |
| `lib/optimizer-v2/time-calculator.ts` | Calculate available watch time |
| `lib/optimizer-v2/prioritizer.ts` | Score and order content |
| `lib/optimizer-v2/scheduler.ts` | Schedule content into time slots |
| `lib/optimizer-v2/subscription-optimizer.ts` | Optimize subscription windows |
| `lib/optimizer-v2/action-generator.ts` | Generate this week's actions |
| `lib/optimizer-v2/optimizer.ts` | Main orchestrator |
| `app/api/optimizer/route.ts` | API endpoint (update) |
| `supabase/migrations/010_optimizer_plans.sql` | Cache table |

### Key Types

```typescript
interface WatchIntent {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  source: 'taste_match' | 'watchlist' | 'friend_share' | 'binge_plan' | 'favorite'
  source_details?: { friend_id?: string; friend_name?: string }
  service_id: string
  service_name: string
  release_date: string | null
  taste_match_score: number
  priority_score: number
  deadline?: string
  deadline_reason?: string
}

interface OptimizedPlan {
  generated_at: string
  inputs_hash: string
  watch_intents: WatchIntent[]
  watch_schedule: WatchSlot[]
  subscription_windows: SubscriptionWindow[]
  this_week_actions: ThisWeekAction[]
  savings: { current_yearly, optimized_yearly, savings_yearly, savings_percent }
}
```

### Hybrid AI Approach

**Algorithmic (deterministic):**
- Intent building from sources
- Priority scoring (deadline boost, friend boost, taste match)
- Time slot scheduling
- Subscription window calculations
- Savings calculations

**Claude AI (when needed):**
- Complex scheduling conflicts (competing deadlines)
- Natural language explanations for recommendations
- Edge case handling (what to do when overloaded)

### Tasks
1. Create types.ts with all interfaces
2. TDD: intent-builder (12 tests)
3. TDD: time-calculator (6 tests)
4. TDD: prioritizer (8 tests)
5. TDD: scheduler (8 tests)
6. TDD: subscription-optimizer (8 tests)
7. TDD: action-generator (6 tests)
8. TDD: optimizer orchestrator (6 tests)
9. TDD: recalculator (4 tests)
10. Update API route (4 tests)
11. Create migration 010_optimizer_plans.sql
12. Update documentation

### Verification
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## Phase 2: UX-2 Auto-Pilot

### Branch: `feature/ux-2-auto-pilot`

### Goal
System acts automatically without user effort. Auto-pause, auto-remind, handle missed deadlines.

### Critical Files

| File | Purpose |
|------|---------|
| `lib/auto-pilot/types.ts` | AutoAction, UserBehaviorPattern types |
| `lib/auto-pilot/action-executor.ts` | Execute scheduled actions |
| `lib/auto-pilot/deadline-detector.ts` | Find missed deadlines |
| `lib/auto-pilot/deadline-handler.ts` | Handle missed deadlines |
| `lib/auto-pilot/behavior-tracker.ts` | Track user patterns |
| `lib/auto-pilot/notification-sender.ts` | Send action notifications |
| `app/api/auto-pilot/execute/route.ts` | Cron endpoint |
| `app/api/optimizer/apply/route.ts` | Apply plan (update) |
| `supabase/migrations/011_auto_pilot.sql` | auto_actions, user_behavior_patterns |
| `vercel.json` | Cron configuration |

### Tasks
1. Create types.ts
2. TDD: action-executor (8 tests)
3. TDD: deadline-detector (6 tests)
4. TDD: deadline-handler (6 tests)
5. TDD: behavior-tracker (6 tests)
6. TDD: notification-sender (4 tests)
7. Create migration 011_auto_pilot.sql
8. TDD: execute route (4 tests)
9. TDD: apply route updates (4 tests)
10. Configure vercel.json cron

---

## Phase 3: UX-3 Unified Content Calendar

### Branch: `feature/ux-3-unified-calendar`

### Goal
Single Content Calendar page with 4 sections that shows everything and controls everything.

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  1. OPTIMIZER SUMMARY                                       │
│     - Savings number + progress bar                         │
│     - This Week's Actions                                   │
│     - Apply All / Regenerate buttons                        │
├─────────────────────────────────────────────────────────────┤
│  2. WATCH QUEUE                                             │
│     - Prioritized list with deadlines                       │
│     - Friend-shared shows flagged                           │
│     - One-tap actions per item                              │
├─────────────────────────────────────────────────────────────┤
│  3. CALENDAR VIEW                                           │
│     - Visual timeline (month grid)                          │
│     - Subscription windows (solid/dotted bars)              │
│     - Release markers                                       │
├─────────────────────────────────────────────────────────────┤
│  4. UPCOMING RELEASES                                       │
│     - Content list with taste match scores                  │
│     - Friend activity indicators                            │
│     - One-tap actions per release                           │
└─────────────────────────────────────────────────────────────┘
```

### Critical Files

| File | Purpose |
|------|---------|
| `components/calendar-unified/OptimizerSummary.tsx` | Top section |
| `components/calendar-unified/WatchQueue.tsx` | Prioritized queue |
| `components/calendar-unified/CalendarView.tsx` | Timeline view |
| `components/calendar-unified/UpcomingReleases.tsx` | Release list |
| `components/calendar-unified/ReleaseDetailModal.tsx` | Content details |
| `components/calendar-unified/ContentCalendarPage.tsx` | Main orchestrator |
| `app/(app)/calendar/page.tsx` | Page (update) |

### Tasks
1. TDD: OptimizerSummary (8 tests)
2. TDD: WatchQueue (8 tests)
3. TDD: CalendarView (10 tests)
4. TDD: UpcomingReleases (8 tests)
5. TDD: ReleaseDetailModal (6 tests)
6. TDD: ContentCalendarPage (6 tests)
7. Update calendar page

---

## Phase 4: UX-4 One-Tap Actions

### Branch: `feature/ux-4-one-tap-actions`

### Goal
User can control everything from the calendar without navigating away.

### Critical Files

| File | Purpose |
|------|---------|
| `app/api/queue/route.ts` | Queue CRUD |
| `app/api/queue/binge/route.ts` | Plan binge endpoint |
| `app/api/queue/watch-together/route.ts` | Social watching |
| `app/api/calendar/actions/route.ts` | Calendar actions |
| `lib/calendar-unified/action-handlers.ts` | Client-side handlers |
| `components/calendar-unified/CalendarView.tsx` | Add drag-drop |

### Tasks
1. TDD: Queue API (6 tests)
2. TDD: Binge queue API (4 tests)
3. TDD: Watch together API (4 tests)
4. TDD: Calendar actions API (6 tests)
5. TDD: Client action handlers (10 tests)
6. TDD: Page integration (6 tests)
7. TDD: Drag-and-drop (4 tests)

---

## Phase 5: UX-5 Remove Old Pages

### Branch: `feature/ux-5-remove-old-pages`

### Goal
Remove redundant pages, simplify navigation, and make `/calendar` the default landing page.

### Files to Delete

| Directory | Reason |
|-----------|--------|
| `app/(app)/recommendations/` | Merged into calendar |
| `components/recommendations/` | Merged into calendar |
| `app/api/recommendations/` | Replaced by optimizer-v2 |
| `app/(app)/optimizer/` | Merged into calendar |
| `app/(app)/binge/` | Merged into calendar |
| `components/binge/` | Logic in queue/binge API |

### Files to Rename (Keep as Fallback)

| From | To |
|------|-----|
| `lib/optimizer/` | `lib/optimizer-legacy/` |
| `components/optimizer/` | `components/optimizer-legacy/` |
| `*.test.ts` in above | `*.legacy.test.ts` |

### Files to Update

| File | Change |
|------|--------|
| `components/layout/sidebar.tsx` | Remove 3 links (6 items remain) |
| `middleware.ts` | Redirect authenticated users to `/calendar` instead of `/dashboard` |
| `next.config.js` | Add redirects |

### New Sidebar (6 items)
```
📊 Dashboard
📅 Content Calendar ← The super page
👥 Household
👥 Friends
🔔 Reminders
⚙️ Settings
```

### Redirects
```javascript
{ source: '/recommendations', destination: '/calendar', permanent: true }
{ source: '/optimizer', destination: '/calendar', permanent: true }
{ source: '/binge', destination: '/calendar', permanent: true }
```

---

## Phase 6: UX-6 New User Experience

### Branch: `feature/ux-6-new-user-experience`

### Goal
Brand new user understands app and sees value in 30 seconds.

### Critical Files

| File | Purpose |
|------|---------|
| `components/calendar-unified/EmptyState.tsx` | Empty state guidance |
| `components/calendar-unified/InlineTastePicker.tsx` | Quick genre selection |
| `components/calendar-unified/QuickAddService.tsx` | Fast subscription add |
| `components/calendar-unified/Tooltip.tsx` | Progressive disclosure |
| `components/calendar-unified/FirstSavingsPopup.tsx` | Celebration moment |
| `lib/calendar-unified/tooltips.ts` | Tooltip config |

---

## Phase 7: UX-7 Edge Case Handling

### Branch: `feature/ux-7-edge-cases`

### Goal
System handles real-world chaos gracefully.

### Critical Files

| File | Purpose |
|------|---------|
| `lib/edge-cases/content-monitor.ts` | Detect content changes |
| `lib/edge-cases/price-monitor.ts` | Detect price changes |
| `lib/edge-cases/activity-monitor.ts` | Track watch activity |
| `lib/edge-cases/vacation-mode.ts` | Pause everything |
| `lib/edge-cases/queue-manager.ts` | Handle overloaded queue |
| `app/api/edge-cases/check/route.ts` | Daily cron check |
| `components/settings/VacationMode.tsx` | Vacation UI |
| `supabase/migrations/012_vacation_mode.sql` | Profile columns |

---

## Phase 8: UX-8 Social Integration

### Branch: `feature/ux-8-social-integration`

### Goal
Friends enhance the calendar experience naturally.

### Critical Files

| File | Purpose |
|------|---------|
| `lib/social-integration/friend-activity.ts` | Friend activity for calendar |
| `lib/social-integration/share-handler.ts` | Handle friend shares |
| `lib/social-integration/watch-together.ts` | Schedule joint watching |
| `lib/social-integration/spoiler-alert.ts` | Spoiler warnings |
| `components/calendar-unified/UpcomingReleases.tsx` | Add friend indicators |
| `components/calendar-unified/WatchQueue.tsx` | Add friend badges |

---

## Phase 9: UX-9 Polish

### Branch: `feature/ux-9-polish`

### Goal
Instagram-level smoothness and delight.

### Critical Files

| File | Purpose |
|------|---------|
| `components/ui/confetti.tsx` | Celebration animation |
| `components/ui/skeleton.tsx` | Shimmer animation (update) |
| `lib/haptics.ts` | Mobile haptic feedback |
| `components/layout/BottomNav.tsx` | Mobile bottom navigation |
| `components/settings/DarkModeToggle.tsx` | Dark mode |
| `tailwind.config.js` | Dark mode config |

### Polish Items
- Savings number 2x larger (text-6xl, text-green-600)
- Animated progress bar
- Confetti on "Apply All" success
- Drag ghost preview (opacity-50, scale-105)
- Pull-to-refresh on mobile
- Skeleton shimmer animation
- "Analyzing..." typewriter effect
- Dark mode support
- Mobile bottom navigation
- Lighthouse audit (target 90+)

---

## Database Migrations

### 010_optimizer_plans.sql
```sql
CREATE TABLE optimizer_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  plan JSONB NOT NULL,
  inputs_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);
-- Indexes and RLS policies
```

### 011_auto_pilot.sql
```sql
CREATE TABLE auto_actions (...);
CREATE TABLE user_behavior_patterns (...);
-- Indexes and RLS policies
```

### 012_vacation_mode.sql
```sql
ALTER TABLE profiles ADD COLUMN vacation_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN vacation_return_date DATE;
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
```

---

## Verification

Each phase runs:
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Final verification after UX-9:
```bash
npm test
npx lighthouse http://localhost:3000/calendar --output=json
```

---

## Definition of Done (Overall)

- [ ] All 9 UX phases complete
- [ ] 972+ tests passing
- [ ] Sidebar has 6 items
- [ ] Content Calendar is the unified hub and default landing page
- [ ] Optimizer brain generates smart plans (hybrid AI)
- [ ] Auto-pilot handles actions automatically
- [ ] All actions work without navigation (optimistic updates)
- [ ] New users see value in 30 seconds
- [ ] Edge cases handled gracefully
- [ ] Social features integrated naturally
- [ ] Lighthouse scores 90+
- [ ] Dark mode works
- [ ] Mobile experience smooth
- [ ] Legacy optimizer available as fallback
