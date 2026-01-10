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
| `feature/phase-1-foundation` | in-progress | Project setup, auth, database, UI shell |

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

## Branch: feature/phase-1-foundation

### Goal
Initialize SubCycle project with Next.js 14, Supabase auth, database schema, and basic UI shell.

### Scope
**Included:**
- Next.js 14 + Tailwind + shadcn/ui setup
- Supabase project with all tables + RLS policies
- Auth pages (login, signup)
- App layout with sidebar navigation
- Route protection middleware
- Seed data for streaming services

**Excluded:**
- Onboarding flow (Phase 2)
- Dashboard functionality (Phase 3)
- TMDB integration (Phase 4)
- AI recommendations (Phase 5)

### Tasks
- [ ] Initialize Next.js 14 project with Tailwind
- [ ] Install and configure shadcn/ui (button, card, input, dialog, badge)
- [ ] Create Supabase project and configure environment variables
- [ ] Create database tables: profiles, taste_profiles, services, subscriptions, reminders, content
- [ ] Set up RLS policies for all tables
- [ ] Seed services table with top 15 streaming services
- [ ] Create /login page with Supabase Auth
- [ ] Create /signup page with Supabase Auth
- [ ] Create app layout with sidebar navigation
- [ ] Create auth middleware for route protection
- [ ] Add .gitignore for Node/Next.js

### Files
| File | Owner |
|------|-------|
| `app/(auth)/*` | Agent |
| `app/(app)/layout.tsx` | Agent |
| `lib/supabase/*` | Agent |
| `middleware.ts` | Agent |
| `supabase/migrations/*` | Agent |

### Verification
```bash
# Dev server runs
npm run dev

# Can access login page
# Can sign up new user
# Can log in
# Protected routes redirect when logged out
# Database tables exist in Supabase dashboard
```

### Definition of Done
- [ ] All tasks complete
- [ ] All tests pass
- [ ] User can sign up, log in, log out
- [ ] Protected routes work correctly
- [ ] Database schema matches plan
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

