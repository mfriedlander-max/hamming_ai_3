# SubCycle — Phases 7-14 Plan (Complete)

Add these branch sections to AI_PLAN.md when ready to implement.

---

## Overview

| Phase | Feature | Depends On | Parallel? |
|-------|---------|------------|-----------|
| 7a | Editable Taste Profile | - | Yes (with 7b) |
| 7b | Account Linking (Email Detection) | - | Yes (with 7a) |
| 8 | Kanban Board View | - | No |
| 9 | Content Calendar | - | No |
| 10 | Subscription Optimizer | 7a, 9 | No |
| 11 | Binge Planner | 10 | No |
| 12 | Smart Notifications + Auto-Remind | 10, 11 | No |
| 13a | Household Mode | 10 | Yes (with 13b) |
| 13b | Social/Friends | 10 | Yes (with 13a) |
| 14 | Deal Tracker | - | Anytime |

---

## Branch: feature/phase-7a-editable-taste

### Goal
Allow users to edit their taste profile (genres, favorite shows) anytime from settings. Changes trigger recommendation refresh.

### Scope
**Included:**
- Settings page with editable taste profile
- Genre chips (add/remove)
- Favorite shows list (add/remove with TMDB search)
- Save triggers recommendation cache invalidation
- "Edit Preferences" quick link on dashboard

**Excluded:**
- Watch history import (separate integration)
- Household taste aggregation (Phase 13a)

### Tasks
- [ ] Create `src/lib/errors.ts` (AppError class, error codes, API error responses)
- [ ] Create `src/components/ui/LoadingSpinner.tsx` (shared loading component)
- [ ] Create `src/app/(app)/settings/page.tsx` with tabs structure
- [ ] Create `src/components/settings/TasteProfileEditor.tsx`
  - Genre multi-select chips (same genres as onboarding)
  - Visual feedback on add/remove
- [ ] Create `src/components/settings/FavoriteShowsEditor.tsx`
  - List current favorites with remove button
  - Search input to add new shows
- [ ] Create `src/components/settings/ShowSearchInput.tsx`
  - TMDB search integration
  - Debounced input (300ms)
  - Results dropdown with posters
- [ ] Create `src/app/api/taste-profile/route.ts` (GET, PATCH)
- [ ] Create `src/app/api/search/shows/route.ts` (TMDB show/movie search)
- [ ] Add cache invalidation: PATCH taste → delete recommendation cache for user
- [ ] Update sidebar with Settings link
- [ ] Add "Edit Preferences" button to dashboard header
- [ ] Write tests (target: 18 new tests)
- [ ] E2E: Edit genres → add show via search → save → verify recommendations refresh

### Files
| File | Owner |
|------|-------|
| `src/app/(app)/settings/page.tsx` | Phase-7a |
| `src/components/settings/TasteProfileEditor.tsx` | Phase-7a |
| `src/components/settings/FavoriteShowsEditor.tsx` | Phase-7a |
| `src/components/settings/ShowSearchInput.tsx` | Phase-7a |
| `src/app/api/taste-profile/route.ts` | Phase-7a |
| `src/app/api/search/shows/route.ts` | Phase-7a |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (218+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-7b-account-linking

### Goal
Allow users to enter their email addresses to automatically detect subscription services they're signed up for by scanning for known subscription confirmation email patterns.

### Scope
**Included:**
- Add email addresses to profile
- Gmail OAuth integration for email scanning
- Pattern matching for subscription confirmation emails (Netflix, Hulu, HBO, etc.)
- Auto-populate detected subscriptions
- Manual confirmation before adding (user approves detected services)
- "Scan for subscriptions" button

**Excluded:**
- Direct API integration with streaming services (no public APIs)
- Reading email content beyond pattern matching
- Auto-sync (one-time scan per request)

### Tasks
- [ ] Add `user_emails` table: (id, user_id, email, provider, access_token_encrypted, created_at)
- [ ] Create `src/lib/email/gmail-client.ts` (Gmail API OAuth + search)
- [ ] Create `src/lib/email/patterns.ts` (regex patterns for each service's confirmation emails)
- [ ] Create `src/lib/email/detector.ts` (scan emails, return detected services)
- [ ] Create `src/lib/email/types.ts`
- [ ] Create `src/app/api/auth/gmail/route.ts` (OAuth callback)
- [ ] Create `src/app/api/auth/gmail/disconnect/route.ts` (revoke access)
- [ ] Create `src/app/api/subscriptions/detect/route.ts` (trigger scan, return detected)
- [ ] Create `src/components/settings/EmailAccountsManager.tsx`
  - List connected emails
  - "Connect Gmail" button
  - Disconnect option
- [ ] Create `src/components/settings/SubscriptionDetector.tsx`
  - "Scan for Subscriptions" button
  - Loading state during scan
  - Results list with checkboxes
  - "Add Selected" button
- [ ] Create `src/components/onboarding/EmailDetectionStep.tsx` (optional onboarding step)
- [ ] Add to Settings page as "Connected Accounts" tab
- [ ] Write tests (target: 20 new tests)
- [ ] E2E: Connect Gmail → scan → detect Netflix → approve → verify added to dashboard
- [ ] Document Google OAuth verification requirements in README (gmail.readonly = sensitive scope)

**⚠️ OAuth Note:** Gmail readonly scope requires Google verification review (can take weeks). Plan for this in timeline.

### Files
| File | Owner |
|------|-------|
| `src/lib/email/*` | Phase-7b |
| `src/app/api/auth/gmail/*` | Phase-7b |
| `src/app/api/subscriptions/detect/route.ts` | Phase-7b |
| `src/components/settings/EmailAccountsManager.tsx` | Phase-7b |
| `src/components/settings/SubscriptionDetector.tsx` | Phase-7b |
| `src/components/onboarding/EmailDetectionStep.tsx` | Phase-7b |

### Email Detection Patterns
```typescript
// src/lib/email/patterns.ts
export const SERVICE_EMAIL_PATTERNS = {
  netflix: {
    from: ['info@netflix.com', 'netflix@netflix.com'],
    subject: ['Welcome to Netflix', 'Your Netflix membership', 'Thanks for joining Netflix']
  },
  hulu: {
    from: ['hulu@hulumail.com', 'no-reply@hulu.com'],
    subject: ['Welcome to Hulu', 'Your Hulu subscription']
  },
  'disney-plus': {
    from: ['disneyplus@mail.disneyplus.com'],
    subject: ['Welcome to Disney+', 'Your Disney+ subscription']
  },
  'hbo-max': {
    from: ['max@mail.max.com', 'hbomax@email.hbomax.com'],
    subject: ['Welcome to Max', 'Welcome to HBO Max']
  },
  'prime-video': {
    from: ['auto-confirm@amazon.com', 'prime@amazon.com'],
    subject: ['Prime Video', 'Your Prime membership']
  },
  // ... patterns for all 15 services
}
```

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (238+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-8-kanban-board

### Goal
Replace current list view with Kanban board organization. Subscriptions organized into columns: Worth It, Waste, Paused, Scheduled.

### Scope
**Included:**
- Kanban board with 4 columns
- Drag-and-drop between columns
- Column shows total cost
- AI recommendation badge on each card
- Board state persisted to database
- Responsive (stacked on mobile)

**Excluded:**
- Custom columns (fixed 4 for v1)
- Multiple boards per user

### Board Columns
| Column | Meaning | Status |
|--------|---------|--------|
| **Worth It** | Active, good content coming | `active` + `board: worth_it` |
| **Waste** | Active, nothing you'd like coming | `active` + `board: waste` |
| **Paused** | Cancelled, watching for reactivation | `paused` + `board: paused` |
| **Scheduled** | Will reactivate on date | `paused` + `board: scheduled` |

**Business Rule:** Board and status must be consistent:
- `worth_it` / `waste` → status MUST be `active`
- `paused` / `scheduled` → status MUST be `paused`
Enforce in API route with validation.

### Tasks
- [ ] Add `board` column to subscriptions table: `TEXT CHECK (board IN ('worth_it', 'waste', 'paused', 'scheduled')) DEFAULT 'worth_it'`
- [ ] Create `src/components/board/SubscriptionBoard.tsx`
  - DndContext from @dnd-kit
  - 4 BoardColumn children
  - Handle drag end → update DB
- [ ] Create `src/components/board/BoardColumn.tsx`
  - Droppable area
  - Column header (title, count, total $)
  - List of SubscriptionCard
  - Empty state per column
- [ ] Create `src/components/board/DraggableCard.tsx`
  - Wraps SubscriptionCard with drag handle
  - Visual feedback while dragging
- [ ] Update `src/components/subscriptions/SubscriptionCard.tsx`
  - Add recommendation badge slot
  - Add "Scheduled for: [date]" when in scheduled column
- [ ] Update `src/app/api/subscriptions/[id]/route.ts` PATCH to handle `board` field
- [ ] Update `src/app/(app)/dashboard/page.tsx` to use SubscriptionBoard
- [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable`
- [ ] Add column totals (sum of monthly_cost per column)
- [ ] Mobile: Stack columns vertically with collapse/expand
- [ ] Write tests (target: 22 new tests)
- [ ] E2E: Drag subscription from Worth It to Paused → verify DB updated → refresh → verify position

### Files
| File | Owner |
|------|-------|
| `src/components/board/SubscriptionBoard.tsx` | Phase-8 |
| `src/components/board/BoardColumn.tsx` | Phase-8 |
| `src/components/board/DraggableCard.tsx` | Phase-8 |
| `src/components/subscriptions/SubscriptionCard.tsx` | Phase-8 (update) |
| `src/app/(app)/dashboard/page.tsx` | Phase-8 (update) |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (260+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-9-content-calendar

### Goal
Timeline view showing content releases across all streaming services with visual "subscription windows" showing optimal subscribe periods.

### Scope
**Included:**
- Horizontal timeline (6-month default, expandable to 12)
- Swim lane per service (user's subscriptions + paused)
- Content release markers (dots/thumbnails)
- Highlighted releases that match user taste
- Subscription window bars (when to have each service)
- Click release for detail modal
- "Set Reminder" from release

**Excluded:**
- Auto-scheduling (manual reminders only)
- External calendar sync (Google Calendar etc.)

### Tasks
- [ ] Create `src/lib/calendar/windows.ts` (calculate subscription windows from content)
- [ ] Create `src/lib/calendar/types.ts` (ContentRelease, SubscriptionWindow, etc.)
- [ ] Create `src/app/api/calendar/route.ts` (GET releases + windows for date range)
- [ ] Create `src/components/calendar/ContentCalendar.tsx`
  - Date range selector (3mo / 6mo / 12mo)
  - Month headers
  - Service swim lanes
- [ ] Create `src/components/calendar/ServiceLane.tsx`
  - Service logo + name
  - Timeline bar
  - Content markers positioned by date
  - Subscription window overlay bar
- [ ] Create `src/components/calendar/ContentMarker.tsx`
  - Small dot or mini poster
  - Highlighted if matches taste
  - Hover tooltip (title, date)
  - Click opens detail modal
- [ ] Create `src/components/calendar/SubscriptionWindow.tsx`
  - Colored bar overlay
  - Shows "Subscribe: [date] → Cancel: [date]"
  - Tooltip with savings info
- [ ] Create `src/components/calendar/ContentDetailModal.tsx`
  - Full poster, title, overview
  - Release date, genres
  - Service availability
  - "Set Reminder" button
  - "Plan Binge" button (disabled placeholder, enabled in Phase 11)
- [ ] Create `src/app/(app)/calendar/page.tsx`
- [ ] Add sidebar link to Calendar
- [ ] Write tests (target: 25 new tests)
- [ ] E2E: View calendar → scroll to future month → click release → set reminder

### Subscription Window Algorithm
```typescript
// src/lib/calendar/windows.ts
export function calculateSubscriptionWindows(
  serviceId: string,
  content: MatchedContent[],
  tasteProfile: TasteProfile
): SubscriptionWindow[] {
  // 1. Filter to matching content only (score >= 40)
  const matches = content.filter(c => c.match_score >= 40)
  
  // 2. Sort by release date
  matches.sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
  
  // 3. Cluster releases within 45 days of each other
  const clusters = clusterByProximity(matches, 45)
  
  // 4. Create window per cluster
  return clusters.map(cluster => ({
    service_id: serviceId,
    start_date: subDays(cluster[0].release_date, 2), // Subscribe 2 days before
    end_date: addDays(cluster[cluster.length - 1].release_date, 14), // Keep 2 weeks after
    content: cluster,
    estimated_cost: calculateCost(cluster, servicePrice)
  }))
}
```

### Files
| File | Owner |
|------|-------|
| `src/lib/calendar/*` | Phase-9 |
| `src/app/api/calendar/route.ts` | Phase-9 |
| `src/components/calendar/*` | Phase-9 |
| `src/app/(app)/calendar/page.tsx` | Phase-9 |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (285+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-10-optimizer

### Goal
AI-powered subscription optimizer that calculates optimal subscribe/cancel schedule across ALL services to maximize content while minimizing cost.

### Scope
**Included:**
- Cross-service content analysis
- Optimal calendar generation (12-month view)
- Savings projection (current vs optimized spend)
- Monthly action plan ("Cancel Netflix Feb 1, resubscribe Apr 10")
- Claude prompt for holistic optimization
- Resume dates for each pause recommendation
- Consider show length in timing

**Excluded:**
- Auto-execution of cancellations
- Billing/payment integration

### Tasks
- [ ] Create `src/lib/optimizer/analyzer.ts` (aggregate content across services)
- [ ] Create `src/lib/optimizer/savings.ts` (cost calculations)
- [ ] Create `src/lib/optimizer/prompt.ts` (Claude optimizer prompt)
- [ ] Create `src/lib/optimizer/types.ts` (OptimizedSchedule, ServiceAction, etc.)
- [ ] Create `src/app/api/optimizer/route.ts` (generate optimized plan)
- [ ] Create `src/components/optimizer/OptimizedCalendar.tsx`
  - 12-month visual timeline
  - Per-service bars showing active periods
  - Color coded (active = green, paused = gray)
- [ ] Create `src/components/optimizer/SavingsSummary.tsx`
  - Current annual spend
  - Optimized annual spend
  - Total savings
  - Percentage saved
- [ ] Create `src/components/optimizer/ActionPlan.tsx`
  - Month-by-month action list
  - "February: Cancel Netflix, Keep HBO"
  - Resume dates included
- [ ] Create `src/components/optimizer/ServiceScheduleCard.tsx`
  - Per-service breakdown
  - Active months highlighted
  - Key content in each window
- [ ] Create `src/app/(app)/optimizer/page.tsx`
- [ ] Add "Apply Plan" button → bulk updates subscriptions + creates reminders
- [ ] Add sidebar link to Optimizer
- [ ] Write tests (target: 28 new tests)
- [ ] E2E: Generate plan → verify savings → apply plan → verify reminders created

### Claude Optimizer Prompt
```typescript
// src/lib/optimizer/prompt.ts
export function buildOptimizerPrompt(data: OptimizerInput): string {
  return `You are a subscription optimizer. Calculate the most cost-effective way to access content the user wants.

USER TASTE:
- Genres: ${data.taste.genres.join(', ')}
- Favorite shows: ${data.taste.favorite_shows.join(', ')}

CURRENT SUBSCRIPTIONS:
${data.subscriptions.map(s => `- ${s.service.name}: $${s.monthly_cost}/mo`).join('\n')}
Total: $${data.totalMonthlyCost}/mo ($${data.totalMonthlyCost * 12}/yr)

UPCOMING CONTENT (next 12 months):
${data.contentByService.map(s => `
${s.serviceName}:
${s.content.map(c => `  - ${c.title} (${c.release_date}) - ${c.match_score}% match - ${c.runtime || 'N/A'}`).join('\n')}
`).join('\n')}

RULES:
- User needs ~1 week per 8 episodes to binge
- Movies can be watched in one session
- Prefer clustering content to minimize subscription gaps
- A service with <2 matching titles in 6 months should be paused
- Factor in monthly cost (expensive services need more value)
- Always provide resume_date for pause recommendations

OUTPUT (JSON):
{
  "schedule": [
    {
      "service_id": "...",
      "service_name": "Netflix",
      "action": "pause_until",
      "pause_date": "2025-02-01",
      "resume_date": "2025-04-10",
      "reason": "Nothing until Stranger Things S5",
      "key_content": ["Stranger Things S5", "Black Mirror S7"],
      "months_active": 3,
      "estimated_cost": 47.97
    }
  ],
  "summary": {
    "current_yearly": 792,
    "optimized_yearly": 456,
    "savings": 336,
    "savings_percent": 42
  }
}`
}
```

### Files
| File | Owner |
|------|-------|
| `src/lib/optimizer/*` | Phase-10 |
| `src/app/api/optimizer/route.ts` | Phase-10 |
| `src/components/optimizer/*` | Phase-10 |
| `src/app/(app)/optimizer/page.tsx` | Phase-10 |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (313+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-11-binge-planner

### Goal
Calculate exact subscribe/cancel dates for specific shows based on episode count and user's watch speed.

### Scope
**Included:**
- Show-specific binge duration calculation
- Optimal subscribe date (1-2 days before release)
- Optimal cancel date (after binge complete)
- "Weekend Binge Mode" (what can you finish this weekend?)
- Track user watch speed over time
- Direct "Set Reminder" for subscribe/cancel dates

**Excluded:**
- External calendar sync
- Watch party scheduling

### Tasks
- [ ] Create `src/lib/binge/calculator.ts` (duration from episodes + runtime)
- [ ] Create `src/lib/binge/scheduler.ts` (subscribe/cancel date logic)
- [ ] Create `src/lib/binge/types.ts` (BingePlan, WatchSpeed)
- [ ] Add `watch_speed` column to profiles (default: 2 eps/day)
- [ ] Create `src/app/api/binge/plan/route.ts` (generate binge plan for show)
- [ ] Create `src/app/api/binge/weekend/route.ts` (what fits in X hours)
- [ ] Create `src/components/binge/BingePlanCard.tsx`
  - Show poster + title
  - Episode count, total runtime
  - "Subscribe: [date]" → "Cancel: [date]"
  - Cost estimate
  - "Set Reminders" button (creates both)
- [ ] Create `src/components/binge/WeekendMode.tsx`
  - "I have X hours this weekend" input
  - Results: shows you could finish
  - Filtered by subscribed services
- [ ] Create `src/components/binge/BingeTimeline.tsx`
  - Visual timeline of binge period
  - Day-by-day episode markers
- [ ] Create `src/components/binge/WatchSpeedSetting.tsx`
  - Slider: 1-6 episodes per day
  - Saved to profile
- [ ] Create `src/app/(app)/binge/page.tsx`
  - Search for show
  - Display BingePlanCard
  - Weekend Mode section
- [ ] Add "Plan Binge" button to ContentDetailModal (Phase 9)
- [ ] Add sidebar link to Binge Planner
- [ ] Write tests (target: 22 new tests)
- [ ] E2E: Search show → generate plan → set reminders → verify both created

### Binge Calculator
```typescript
// src/lib/binge/calculator.ts
export function calculateBingePlan(
  show: ContentDetails,
  watchSpeed: number, // episodes per day
  releaseDate: Date
): BingePlan {
  const totalEpisodes = show.number_of_episodes || show.seasons * 10 // estimate
  const avgRuntime = show.episode_run_time?.[0] || 45 // minutes
  
  const daysToComplete = Math.ceil(totalEpisodes / watchSpeed)
  const totalHours = (totalEpisodes * avgRuntime) / 60
  
  return {
    show_id: show.id,
    show_title: show.name,
    total_episodes: totalEpisodes,
    total_hours: Math.round(totalHours),
    days_to_complete: daysToComplete,
    subscribe_date: subDays(releaseDate, 1),
    cancel_date: addDays(releaseDate, daysToComplete + 2), // buffer
    estimated_cost: calculateMonthlyCost(daysToComplete, show.service_price)
  }
}
```

### Files
| File | Owner |
|------|-------|
| `src/lib/binge/*` | Phase-11 |
| `src/app/api/binge/*` | Phase-11 |
| `src/components/binge/*` | Phase-11 |
| `src/app/(app)/binge/page.tsx` | Phase-11 |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (335+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-12-notifications

### Goal
Proactive smart notifications + auto-remind on pause. Alert users about releases, suggest pauses, handle resubscribe reminders automatically.

### Scope
**Included:**
- In-app notification center (bell icon + dropdown)
- Notification types: content_release, pause_suggestion, resubscribe_reminder, price_change
- Auto-create resubscribe reminder when user pauses (using resume_date from optimizer)
- Notification preferences (toggle each type)
- Mark as read / dismiss
- Badge count on bell icon

**Excluded:**
- Email notifications (v2)
- Push notifications (mobile app)

### Tasks
- [ ] Add `notifications` table: (id, user_id, type, title, body, data, read, created_at)
- [ ] Add `notification_preferences` table: (user_id, type, enabled)
- [ ] Create `src/lib/notifications/types.ts`
- [ ] Create `src/lib/notifications/triggers.ts` (when to create notifications)
- [ ] Create `src/lib/notifications/generator.ts` (create notification content)
- [ ] Create `src/app/api/notifications/route.ts` (GET list, PATCH mark read, DELETE)
- [ ] Create `src/app/api/notifications/preferences/route.ts` (GET, PATCH)
- [ ] Create `src/components/notifications/NotificationBell.tsx`
  - Bell icon in header
  - Unread count badge
  - Click opens dropdown
- [ ] Create `src/components/notifications/NotificationDropdown.tsx`
  - List of recent notifications
  - Mark all read button
  - "View all" link
- [ ] Create `src/components/notifications/NotificationCard.tsx`
  - Icon by type
  - Title, body, timestamp
  - Action button (if applicable)
  - Dismiss button
- [ ] Create `src/components/settings/NotificationPreferences.tsx`
- [ ] Update app header to include NotificationBell
- [ ] Add to Settings page as "Notifications" tab
- [ ] **Auto-remind on pause:** When subscription moved to Paused board with resume_date, auto-create resubscribe reminder
- [ ] Create `src/app/api/cron/notifications/route.ts` (daily scan for upcoming content)
  - Protected by CRON_SECRET header verification
  - Configured in vercel.json: `{ "crons": [{ "path": "/api/cron/notifications", "schedule": "0 9 * * *" }] }`
- [ ] Write tests (target: 24 new tests)
- [ ] E2E: Pause subscription → verify reminder auto-created → notification appears

### Auto-Remind Logic
```typescript
// When user pauses a subscription (board update)
async function handleSubscriptionPause(
  subscriptionId: string,
  resumeDate?: Date
) {
  if (resumeDate) {
    // Auto-create resubscribe reminder
    await createReminder({
      user_id: subscription.user_id,
      subscription_id: subscriptionId,
      type: 'resubscribe',
      title: `Resubscribe to ${subscription.service.name}`,
      trigger_date: subDays(resumeDate, 2) // Remind 2 days before
    })
    
    // Create notification confirming auto-remind
    await createNotification({
      user_id: subscription.user_id,
      type: 'resubscribe_reminder',
      title: 'Reminder Set',
      body: `We'll remind you to resubscribe to ${subscription.service.name} on ${format(resumeDate, 'MMM d')}`,
      data: { subscription_id: subscriptionId, resume_date: resumeDate }
    })
  }
}
```

### Files
| File | Owner |
|------|-------|
| `src/lib/notifications/*` | Phase-12 |
| `src/app/api/notifications/*` | Phase-12 |
| `src/components/notifications/*` | Phase-12 |
| `src/components/settings/NotificationPreferences.tsx` | Phase-12 |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (359+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-13a-household

### Goal
Multi-user household support with combined taste profiles and family-aware recommendations.

### Scope
**Included:**
- Create/join household
- Invite members via link
- Per-member taste profiles
- Combined household taste (union of genres/shows)
- Household-aware optimizer ("Mom wants X, Dad wants Y")
- Split cost tracking

**Excluded:**
- Parental controls
- Per-profile watch history

### Tasks
- [ ] Add `households` table: (id, name, created_by, invite_code, created_at)
- [ ] Add `household_members` table: (household_id, user_id, role, display_name)
- [ ] Create `src/lib/household/members.ts` (CRUD operations)
- [ ] Create `src/lib/household/aggregator.ts` (combine taste profiles)
- [ ] Create `src/lib/household/types.ts`
- [ ] Create `src/app/api/household/route.ts` (create, get)
- [ ] Create `src/app/api/household/invite/route.ts` (generate/accept invite)
- [ ] Create `src/app/api/household/members/route.ts` (list, remove)
- [ ] Create `src/components/household/HouseholdSetup.tsx` (create/join flow)
- [ ] Create `src/components/household/MemberCard.tsx`
- [ ] Create `src/components/household/InviteModal.tsx`
- [ ] Create `src/components/household/HouseholdInsights.tsx` (combined recommendations)
- [ ] Create `src/app/(app)/household/page.tsx`
- [ ] Update optimizer to use household taste when available
- [ ] Add sidebar link to Household
- [ ] Write tests (target: 20 new tests)
- [ ] E2E: Create household → invite member → verify combined recommendations

### Files
| File | Owner |
|------|-------|
| `src/lib/household/*` | Phase-13a |
| `src/app/api/household/*` | Phase-13a |
| `src/components/household/*` | Phase-13a |
| `src/app/(app)/household/page.tsx` | Phase-13a |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (379+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-13b-social

### Goal
Social features: connect with friends, see what they're watching, share watchlists.

### Scope
**Included:**
- Send/accept friend requests
- Friends list
- Activity feed ("Alex watched Severance")
- Shared watchlists (collaborative)
- "X friends have this service" indicator

**Excluded:**
- Public profiles
- Comments/reactions
- Group watch parties

### Tasks
- [ ] Add `friendships` table: (id, user_a, user_b, status, created_at)
- [ ] Add `activity_feed` table: (id, user_id, action, content_id, created_at)
- [ ] Add `shared_watchlists` table: (id, name, created_by)
- [ ] Add `watchlist_members` table: (watchlist_id, user_id)
- [ ] Add `watchlist_items` table: (watchlist_id, tmdb_id, type, added_by)
- [ ] Create `src/lib/social/friends.ts`
- [ ] Create `src/lib/social/activity.ts`
- [ ] Create `src/lib/social/watchlists.ts`
- [ ] Create `src/app/api/friends/route.ts` (list, request, accept, remove)
- [ ] Create `src/app/api/activity/route.ts` (feed)
- [ ] Create `src/app/api/watchlists/route.ts` (CRUD)
- [ ] Create `src/components/social/FriendsList.tsx`
- [ ] Create `src/components/social/FriendRequestCard.tsx`
- [ ] Create `src/components/social/ActivityFeed.tsx`
- [ ] Create `src/components/social/SharedWatchlist.tsx`
- [ ] Create `src/components/social/InviteFriendModal.tsx`
- [ ] Create `src/app/(app)/friends/page.tsx`
- [ ] Add sidebar link to Friends
- [ ] Write tests (target: 22 new tests)
- [ ] E2E: Add friend → create watchlist → add items → verify shared

### Files
| File | Owner |
|------|-------|
| `src/lib/social/*` | Phase-13b |
| `src/app/api/friends/route.ts` | Phase-13b |
| `src/app/api/activity/route.ts` | Phase-13b |
| `src/app/api/watchlists/route.ts` | Phase-13b |
| `src/components/social/*` | Phase-13b |
| `src/app/(app)/friends/page.tsx` | Phase-13b |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (401+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-14-deals

### Goal
Track streaming service deals, promos, and price changes with cancellation assistance.

### Scope
**Included:**
- Deals database (manually curated initially)
- Current deals feed
- Price history per service
- Price change alerts (notification integration)
- Bundle optimization suggestions
- **Cancellation Concierge:** Direct cancel links, step-by-step instructions, phone scripts

**Excluded:**
- Auto-scraping deals
- Affiliate links
- Auto-cancellation

### Tasks
- [ ] Add `deals` table: (id, service_id, title, description, discount_percent, valid_from, valid_until, url)
- [ ] Add `price_history` table: (id, service_id, price, recorded_at)
- [ ] Add `cancellation_info` table: (service_id, cancel_url, cancel_method, phone_number, script, steps)
- [ ] Create `src/lib/deals/types.ts`
- [ ] Create `src/app/api/deals/route.ts` (GET current deals)
- [ ] Create `src/app/api/deals/admin/route.ts` (POST/PUT/DELETE deals - admin only)
  - Verify admin role via service role key or admin flag on profile
  - Return 403 for non-admins
- [ ] Create `src/app/api/prices/history/route.ts` (GET price history)
- [ ] Create `src/components/deals/DealCard.tsx`
- [ ] Create `src/components/deals/DealsFeed.tsx`
- [ ] Create `src/components/deals/PriceHistoryChart.tsx` (line chart)
- [ ] Create `src/components/deals/BundleSuggestion.tsx`
- [ ] Create `src/components/cancellation/CancellationGuide.tsx`
  - Service logo + name
  - Cancel method (online / phone / chat)
  - Direct link button
  - Step-by-step instructions
  - Phone script if needed
- [ ] Create `src/components/cancellation/CancellationModal.tsx` (triggered from subscription card)
- [ ] Create `src/app/(app)/deals/page.tsx`
- [ ] Update SubscriptionCard with "Cancel Help" button
- [ ] Add deal badge to service cards when deal active
- [ ] Connect price changes to notification system
- [ ] Add sidebar link to Deals
- [ ] Seed cancellation info for all 15 services
- [ ] Seed initial deals data
- [ ] Write tests (target: 18 new tests)
- [ ] E2E: View deals → click cancel help → verify guide displays

### Cancellation Info Schema
```typescript
// Seeded per service
{
  service_id: 'netflix-uuid',
  cancel_url: 'https://www.netflix.com/cancelplan',
  cancel_method: 'online', // 'online' | 'phone' | 'chat' | 'email'
  phone_number: null,
  script: null,
  steps: [
    'Go to netflix.com and sign in',
    'Click your profile icon → Account',
    'Click "Cancel Membership"',
    'Confirm cancellation'
  ]
}
```

### Files
| File | Owner |
|------|-------|
| `src/lib/deals/*` | Phase-14 |
| `src/app/api/deals/*` | Phase-14 |
| `src/app/api/prices/*` | Phase-14 |
| `src/components/deals/*` | Phase-14 |
| `src/components/cancellation/*` | Phase-14 |
| `src/app/(app)/deals/page.tsx` | Phase-14 |

### Verification
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (419+ total)
- [ ] E2E verification passes
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Execution Order

### Wave 1 (Parallel)
- `feature/phase-7a-editable-taste`
- `feature/phase-7b-account-linking`

**Merge order:** 7a first (creates Settings page), then 7b
**Note:** If 7b completes first, create minimal Settings shell before merging

### Wave 2 (Parallel)
- `feature/phase-8-kanban-board`
- `feature/phase-9-content-calendar`

**No dependencies between them.** Merge in any order.

### Wave 3 (Sequential)
- `feature/phase-10-optimizer` (depends on 7a, 9; enhanced by 7b if available)
- `feature/phase-11-binge-planner` (depends on 10)
- `feature/phase-12-notifications` (depends on 10, 11; uses existing `reminders` table from Phase 6)

### Wave 4 (Parallel)
- `feature/phase-13a-household`
- `feature/phase-13b-social`

**Merge order:** Either first, no dependencies between them

### Wave 5 (Anytime)
- `feature/phase-14-deals` (no dependencies)

---

## Database Migrations Summary

```sql
-- Phase 7b: Account Linking
CREATE TABLE user_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('gmail', 'outlook')) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Phase 8: Kanban Board
ALTER TABLE subscriptions ADD COLUMN board TEXT 
  CHECK (board IN ('worth_it', 'waste', 'paused', 'scheduled')) 
  DEFAULT 'worth_it';

-- Phase 11: Binge Planner
ALTER TABLE profiles ADD COLUMN watch_speed INTEGER DEFAULT 2;

-- Phase 12: Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  content_release BOOLEAN DEFAULT TRUE,
  pause_suggestion BOOLEAN DEFAULT TRUE,
  resubscribe_reminder BOOLEAN DEFAULT TRUE,
  price_change BOOLEAN DEFAULT TRUE
);

-- Phase 13a: Household
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  display_name TEXT,
  UNIQUE(household_id, user_id)
);

-- Phase 13b: Social
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  content_id INTEGER,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE shared_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE watchlist_members (
  watchlist_id UUID REFERENCES shared_watchlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (watchlist_id, user_id)
);

CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES shared_watchlists(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  type TEXT CHECK (type IN ('movie', 'tv')),
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 14: Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  valid_from DATE,
  valid_until DATE,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cancellation_info (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE PRIMARY KEY,
  cancel_url TEXT,
  cancel_method TEXT CHECK (cancel_method IN ('online', 'phone', 'chat', 'email')),
  phone_number TEXT,
  script TEXT,
  steps TEXT[]
);

-- RLS POLICIES (CRITICAL - Enable for all tables)

-- Phase 7b: user_emails
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own emails" ON user_emails
  FOR ALL USING (auth.uid() = user_id);

-- Phase 12: notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Service role only

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Phase 13a: households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view household" ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view household members" ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Owners can manage members" ON household_members
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Phase 13b: social
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() IN (user_a, user_b));
CREATE POLICY "Users can manage own friendships" ON friendships
  FOR ALL USING (auth.uid() IN (user_a, user_b));

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friends can view activity" ON activity_feed
  FOR SELECT USING (
    user_id IN (
      SELECT CASE WHEN user_a = auth.uid() THEN user_b ELSE user_a END
      FROM friendships WHERE status = 'accepted' AND auth.uid() IN (user_a, user_b)
    ) OR user_id = auth.uid()
  );

ALTER TABLE shared_watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view watchlists" ON shared_watchlists
  FOR SELECT USING (
    id IN (SELECT watchlist_id FROM watchlist_members WHERE user_id = auth.uid())
  );

ALTER TABLE watchlist_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view watchlist members" ON watchlist_members
  FOR SELECT USING (
    watchlist_id IN (SELECT watchlist_id FROM watchlist_members WHERE user_id = auth.uid())
  );

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage watchlist items" ON watchlist_items
  FOR ALL USING (
    watchlist_id IN (SELECT watchlist_id FROM watchlist_members WHERE user_id = auth.uid())
  );

-- Phase 14: deals (public read, admin write)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view deals" ON deals FOR SELECT USING (true);
-- Admin insert/update handled via service role

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view price history" ON price_history FOR SELECT USING (true);

ALTER TABLE cancellation_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cancellation info" ON cancellation_info FOR SELECT USING (true);
```

---

## Updated README.md TODO

```markdown
## TODO

- [x] Phase 1: Foundation (auth, database, UI shell)
- [x] Phase 2: Onboarding (service selection, taste quiz)
- [x] Phase 3: Dashboard (subscription list with actions)
- [x] Phase 4: Content Intelligence (TMDB integration)
- [x] Phase 5: AI Recommendations (Claude-powered advice)
- [x] Phase 6: Reminders & Polish
- [ ] Phase 7a: Editable Taste Profile
- [ ] Phase 7b: Account Linking (Email Detection)
- [ ] Phase 8: Kanban Board View
- [ ] Phase 9: Content Calendar
- [ ] Phase 10: Subscription Optimizer
- [ ] Phase 11: Binge Planner
- [ ] Phase 12: Smart Notifications + Auto-Remind
- [ ] Phase 13a: Household Mode
- [ ] Phase 13b: Social/Friends
- [ ] Phase 14: Deal Tracker + Cancellation Concierge
```

---

## Test Count Targets

| After Phase | Total Tests |
|-------------|-------------|
| 6 (current) | 200 |
| 7a | 218 |
| 7b | 238 |
| 8 | 260 |
| 9 | 285 |
| 10 | 313 |
| 11 | 335 |
| 12 | 359 |
| 13a | 379 |
| 13b | 401 |
| 14 | 419 |

---

## Future Phases (Round 2)

These are documented for future planning but not detailed yet:

- **Phase 15:** Annual Planning Mode (budget-constrained yearly subscription planning)
- **Phase 16:** Watch Data Integration (Trakt.tv import)
- **Phase 17:** Enhanced Cross-Platform Intelligence (deeper content analysis)
- **Phase 18:** Mobile App (React Native)
