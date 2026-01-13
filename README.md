# SubCycle

An intelligent subscription manager that tells you when to subscribe and when to pause streaming services based on upcoming content you'd actually watch.

## Purpose

SubCycle analyzes your taste preferences and upcoming content across streaming platforms to give you actionable recommendations: keep, pause, or consider each subscription. Stop paying for services with nothing you want to watch.

## TODO

- [x] Phase 1: Foundation (auth, database, UI shell)
- [x] Phase 2: Onboarding (service selection, taste quiz)
- [x] Phase 3: Dashboard (subscription list with actions)
- [x] Phase 4: Content Intelligence (TMDB integration)
- [x] Phase 5: AI Recommendations (Claude-powered advice)
- [x] Phase 6: Reminders & Polish (25/25 tasks complete)
- [x] Phase 7a: Editable Taste Profile
- [x] Phase 7b: Account Linking (Email Detection)
- [x] Phase 8: Kanban Board View
- [x] Phase 9: Content Calendar
- [x] Phase 10: Subscription Optimizer
- [x] Phase 11: Binge Planner
- [ ] Phase 12: Smart Notifications + Auto-Remind
- [ ] Phase 13a: Household Mode
- [ ] Phase 13b: Social/Friends

## Current Status

Phase 11 complete! 445 tests passing. New Binge Planner helps users calculate optimal subscribe/cancel dates for binge-watching shows based on episode count and watch speed. Features watch speed slider (1-6 eps/day), plan cards with cost estimates, and direct reminder creation. Integrates with Content Calendar via "Plan Binge" button on TV shows. Ready for Phase 12 (Smart Notifications).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind + shadcn/ui
- **Database:** Supabase (Postgres + Auth)
- **Content API:** TMDB
- **AI:** Claude API

## How to Run / Test

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_API_KEY=
ANTHROPIC_API_KEY=
```
