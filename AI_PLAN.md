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
| `feature/phase-4-content` | in-progress | TMDB content intelligence |
| `feature/phase-5-recommendations` | in-progress | Claude AI recommendations |

**Status values:** `active` (permanent branches), `in-progress`, `blocked`, `abandoned`

**Note:** Remove merged/abandoned branches from this table after archiving. History lives in Archive section.

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

## Branch: feature/phase-4-content

### Goal
Fetch upcoming content from TMDB for user's subscribed services and match to user taste with scoring.

### Scope
**Included:**
- TMDB API client and types
- Matching algorithm (genre + favorite show title matching)
- Content sync and matches API endpoints
- Content caching in database (24hr TTL)

**Excluded:**
- AI recommendations (Phase 5)
- UI components (Phase 5)

### Tasks
- [ ] Create shared types in `src/lib/types/content.ts`
- [ ] Create TMDB client with auth header (TDD)
- [ ] Create TMDB response types
- [ ] Create matching.ts with score calculation (TDD)
- [ ] Create `/api/content/sync` route (POST)
- [ ] Create `/api/content/matches` route (GET)

### Files
| File | Owner |
|------|-------|
| `src/lib/types/content.ts` | Phase-4-Agent |
| `src/lib/tmdb/client.ts` | Phase-4-Agent |
| `src/lib/tmdb/types.ts` | Phase-4-Agent |
| `src/lib/tmdb/matching.ts` | Phase-4-Agent |
| `src/app/api/content/sync/route.ts` | Phase-4-Agent |
| `src/app/api/content/matches/route.ts` | Phase-4-Agent |

### Verification
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (matching tests)
- [ ] API returns scored content per service
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

---

## Branch: feature/phase-5-recommendations

### Goal
Claude-powered recommendations with actionable output and UI integration.

### Scope
**Included:**
- Claude API client and prompt templates
- Recommendations API endpoint with caching
- RecommendationBadge, RecommendationCard, RecommendationsSummary components
- /recommendations page with loading/empty states
- Dashboard integration (badge slot, quick pause action)
- Toast notification for pause with auto-reminder

**Excluded:**
- TMDB integration (Phase 4)
- Reminders page CRUD (Phase 6)

### Tasks
- [ ] Create Claude client with auth (TDD)
- [ ] Create prompt templates
- [ ] Create `/api/recommendations` route (POST)
- [ ] Create RecommendationBadge component (TDD)
- [ ] Create RecommendationCard component (TDD)
- [ ] Create RecommendationsSummary component (TDD)
- [ ] Create /recommendations page
- [ ] Update SubscriptionCard with badge slot
- [ ] Add quick pause action with toast + auto-reminder

### Files
| File | Owner |
|------|-------|
| `src/lib/claude/client.ts` | Phase-5-Agent |
| `src/lib/claude/prompts.ts` | Phase-5-Agent |
| `src/app/api/recommendations/route.ts` | Phase-5-Agent |
| `src/components/recommendations/*` | Phase-5-Agent |
| `src/app/(app)/recommendations/page.tsx` | Phase-5-Agent |

### Verification
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass (component tests)
- [ ] Recommendations page works
- [ ] Dashboard shows badges
- [ ] Results written to AI_SCRATCHPAD.md
- [ ] Branch section moved to Archive

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

