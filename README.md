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
- [x] Phase 12: Smart Notifications + Auto-Remind
- [x] Phase 13a: Household Mode
- [x] Phase 13b: Social/Friends
- [x] Direct Cancellation: Cancel subscriptions via external service URLs
- [x] UX-1: Optimizer Brain (unified watch intent system)
- [x] UX-2: Auto-Pilot (automatic subscription management)
- [x] UX-3: Unified Content Calendar (4-section hub page)
- [x] UX-4: One-Tap Actions (queue API, drag-drop, action handlers)
- [x] UX-5: Remove Old Pages (simplified navigation to 6 items)
- [x] UX-6: New User Experience (guided onboarding, tooltips, first savings popup)
- [x] UX-7: Edge Case Handling (vacation mode, queue health, content/price monitoring)
- [x] UX-8: Social Integration (friend activity, watch together, spoiler alerts)
- [x] UX-9: Polish & Dark Mode (confetti, haptics, shimmer skeletons, mobile bottom nav)

## Current Status

**UX Overhaul Complete!** 978 tests passing. All 9 UX phases done. Full dark mode support across the entire app (sidebar, content, navigation, all components). Features include confetti celebrations on Apply All, mobile bottom navigation, shimmer skeleton animations, haptic feedback support, and enhanced drag previews. Instagram-level smoothness achieved.

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
