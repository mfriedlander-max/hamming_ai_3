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

### Testing Requirements
- **Unit tests:** Strict TDD (RED → GREEN → REFACTOR)
- **E2E tests:** Verification gate before merge. Use MCP Playwright tools (`browser_navigate`, `browser_snapshot`, `browser_click`, etc.) to navigate the app, inspect/critique the UI, compare against other UIs for inspiration, and validate critical user-facing flows. Feel free to test E2E without MCP, it is not required if it doesn't make sense.  

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
| `feature/phase-6-reminders-polish` | in-progress | Reminders, logos, user name, polish |

**Status values:** `active` (permanent branches), `in-progress`, `blocked`, `abandoned`

**Note:** Remove merged/abandoned branches from this table after archiving. History lives in Archive section.

---

## Branch: feature/phase-6-reminders-polish

### Goal
Complete reminders feature with calendar view, add service logos, collect user name for greeting, and polish the entire app (loading states, error handling, visual refinement, mobile responsiveness).

### Scope
**Included:**
- Reminders CRUD with calendar view
- Set Reminder modal from dashboard
- User name collection in onboarding + dashboard greeting
- 15 static service logos
- Skeleton loaders for all pages
- Error states with retry buttons
- Mobile responsive sidebar (hamburger menu)
- Responsive grids and touch-friendly calendar
- Visual polish (hover states, consistent spacing)

**Excluded:**
- Email/push notifications for reminders (future)
- Reminder frequency options (one-time only for MVP)
- Savings calculator on dashboard (already on recommendations page)

### Tasks
- [x] Create `src/lib/types/reminder.ts` with Reminder interface
- [x] Create `GET/POST /api/reminders` endpoint
- [x] Create `DELETE /api/reminders/[id]` endpoint
- [x] Create SetReminderModal component (TDD) - 13 tests
- [x] Create ReminderCalendar component (TDD) - 14 tests
- [x] Create ReminderDetails component (TDD) - 7 tests
- [x] Create RemindersClient component (TDD) - 8 tests
- [x] Update reminders page with calendar view
- [x] Enable "Set Reminder" button in SubscriptionCard
- [x] Add `name` column to profiles table (migration)
- [x] Update WelcomeStep to collect user name
- [x] Add greeting to dashboard header
- [ ] Add 15 service logo SVGs to `/public/logos/`
- [ ] Display logos in SubscriptionCard, ServiceSelector, AddSubscriptionModal
- [ ] Create Skeleton component
- [ ] Add skeleton loaders to Dashboard, Recommendations, Reminders
- [ ] Add error banners with retry to all pages
- [ ] Update sidebar for mobile (hamburger + drawer)
- [ ] Make grids responsive (3→2→1 columns)
- [ ] Make calendar touch-friendly
- [ ] Add hover animations to buttons and cards
- [ ] Audit spacing consistency across all pages
- [ ] E2E: Set reminder → appears in calendar → delete reminder
- [ ] E2E: Name collected → greeting shown
- [ ] E2E: Mobile sidebar, grids, calendar work

### Files
| File | Owner |
|------|-------|
| `src/lib/types/reminder.ts` | Phase-6-Agent |
| `src/app/api/reminders/route.ts` | Phase-6-Agent |
| `src/app/api/reminders/[id]/route.ts` | Phase-6-Agent |
| `src/components/reminders/*` | Phase-6-Agent |
| `src/app/(app)/reminders/page.tsx` | Phase-6-Agent |
| `src/components/subscriptions/SubscriptionCard.tsx` | Phase-6-Agent |
| `src/components/subscriptions/DashboardClient.tsx` | Phase-6-Agent |
| `src/components/onboarding/WelcomeStep.tsx` | Phase-6-Agent |
| `src/app/(app)/dashboard/page.tsx` | Phase-6-Agent |
| `public/logos/*.svg` | Phase-6-Agent |
| `supabase/migrations/003_add_profile_name.sql` | Phase-6-Agent |
| `src/components/ui/skeleton.tsx` | Phase-6-Agent |
| `src/components/layout/sidebar.tsx` | Phase-6-Agent |

### Verification
```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (target: 180+ tests)
- [ ] E2E: Reminders flow works end-to-end
- [ ] E2E: User name flow works end-to-end
- [ ] E2E: Mobile responsive verified
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

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

