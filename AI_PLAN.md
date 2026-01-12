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

**Status values:** `active` (permanent branches), `in-progress`, `blocked`, `abandoned`

**Note:** Remove merged/abandoned branches from this table after archiving. History lives in Archive section.

---

## Phases 7-14 Roadmap

**Status:** Phases 1-6 complete (200 tests). Ready for Phase 7.

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

