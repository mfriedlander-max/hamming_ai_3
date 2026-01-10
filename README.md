# SubCycle

An intelligent subscription manager that tells you when to subscribe and when to pause streaming services based on upcoming content you'd actually watch.

## Purpose

SubCycle analyzes your taste preferences and upcoming content across streaming platforms to give you actionable recommendations: keep, pause, or consider each subscription. Stop paying for services with nothing you want to watch.

## TODO

- [x] Phase 1: Foundation (auth, database, UI shell)
- [ ] Phase 2: Onboarding (service selection, taste quiz)
- [ ] Phase 3: Dashboard (subscription list with actions)
- [ ] Phase 4: Content Intelligence (TMDB integration)
- [ ] Phase 5: AI Recommendations (Claude-powered advice)
- [ ] Phase 6: Reminders & Polish

## Current Status

Phase 1 in progress.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
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
