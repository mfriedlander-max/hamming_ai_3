# SubCycle

An intelligent streaming subscription manager that tells you **when to subscribe** and **when to pause** based on upcoming content you'd actually watch.

## The Problem

You're paying for streaming services with nothing you want to watch. Netflix auto-renews while you wait 3 months for the next season. Disney+ charges you monthly but you only care about Marvel releases. The average household wastes **$240/year** on unused streaming subscriptions.

## The Solution

SubCycle analyzes your taste preferences and upcoming content across all your streaming platforms, then creates an optimized subscription schedule:

- **Subscribe** when content you want is releasing
- **Pause** when there's nothing worth watching
- **Resume** automatically before the next big release

## Features

### Core Features
- **Subscription Dashboard** - Track all your streaming services in one place with a drag-and-drop Kanban board (Active / Consider Canceling / Paused / Scheduled)
- **Content Calendar** - Timeline view of upcoming releases across all your subscribed services
- **AI Recommendations** - Claude-powered analysis of which subscriptions to keep, pause, or cancel
- **Taste Profile** - Genre preferences and favorite shows drive all recommendations

### Smart Automation
- **Subscription Optimizer** - 12-month schedule that maximizes content, minimizes cost
- **Auto-Pilot Mode** - Automatic pause/resume with reminders before content drops
- **Binge Planner** - Calculate optimal subscribe dates for binge-watching shows
- **Smart Notifications** - Reminders for renewals, new releases, and price changes

### Social Features
- **Household Mode** - Share subscriptions with family, combined taste profiles
- **Friends & Watchlists** - Connect with friends, share recommendations, watch together
- **Activity Feed** - See what friends are watching and subscribing to

### Quality of Life
- **Dark Mode** - Full dark theme support
- **Mobile-First** - Responsive design with bottom navigation
- **Vacation Mode** - Pause all recommendations while traveling
- **Direct Cancel Links** - One-tap links to cancel subscriptions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres + Auth + RLS) |
| Content API | TMDB (The Movie Database) |
| AI | Claude API (Anthropic) |
| Testing | Vitest + React Testing Library |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- TMDB API key (free)
- Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/subcycle.git
cd subcycle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Content API
TMDB_API_KEY=your_tmdb_api_key

# AI Features
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Development Commands

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app pages
│   │   ├── calendar/      # Content Calendar (main hub)
│   │   ├── dashboard/     # Subscription Kanban board
│   │   ├── friends/       # Social features
│   │   ├── household/     # Household management
│   │   ├── reminders/     # Reminder calendar
│   │   └── settings/      # User preferences
│   ├── (auth)/            # Login/signup pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── calendar-unified/ # Calendar page components
│   ├── subscriptions/    # Dashboard components
│   ├── social/           # Friends & watchlists
│   └── ...
├── lib/                   # Utilities and business logic
│   ├── supabase/         # Database client
│   ├── tmdb/             # TMDB API client
│   ├── claude/           # Claude AI client
│   ├── optimizer-v2/     # Subscription optimization
│   └── ...
└── supabase/
    └── migrations/        # Database schema
```

## Development Progress

### Completed Phases

- [x] **Phase 1:** Foundation (auth, database, UI shell)
- [x] **Phase 2:** Onboarding (service selection, taste quiz)
- [x] **Phase 3:** Dashboard (subscription management)
- [x] **Phase 4:** Content Intelligence (TMDB integration)
- [x] **Phase 5:** AI Recommendations (Claude analysis)
- [x] **Phase 6:** Reminders & Polish
- [x] **Phase 7a:** Editable Taste Profile
- [x] **Phase 7b:** Account Linking (Gmail detection)
- [x] **Phase 8:** Kanban Board View
- [x] **Phase 9:** Content Calendar
- [x] **Phase 10:** Subscription Optimizer
- [x] **Phase 11:** Binge Planner
- [x] **Phase 12:** Smart Notifications
- [x] **Phase 13a:** Household Mode
- [x] **Phase 13b:** Social/Friends

### UX Improvements

- [x] **UX-1:** Optimizer Brain (unified watch intent system)
- [x] **UX-2:** Auto-Pilot (automatic subscription management)
- [x] **UX-3:** Unified Content Calendar (4-section hub)
- [x] **UX-4:** One-Tap Actions (queue API, drag-drop)
- [x] **UX-5:** Simplified Navigation (6 sidebar items)
- [x] **UX-6:** New User Experience (guided onboarding)
- [x] **UX-7:** Edge Cases (vacation mode, queue health)
- [x] **UX-8:** Social Integration (watch together)
- [x] **UX-9:** Polish (dark mode, confetti, haptics)

### Bug Fixes

- [x] Dashboard layout (2x2 Kanban grid)
- [x] Navigation reorder (Calendar first)
- [x] Notification bell overlap
- [x] TMDB content sync & calendar data flow
- [x] Social/Friends API errors
- [x] Calendar Add to Queue action
- [x] Services query column name mismatch
- [x] Watch Queue display (queue_items integration)
- [x] Duplicate queue item handling (friendly 409 response)
- [x] Calendar subscription windows (schema mismatch fix)

## Current Status

**978 tests passing.** All phases complete. Production-ready.

The app successfully syncs content from TMDB (82 items matched across Disney+, AMC+, Netflix) and displays it in the unified Content Calendar. All social features, household mode, and automation systems are functional.

**Content Calendar** fully functional:
- Optimizer Summary shows savings potential
- Watch Queue displays added items with actions
- Calendar View shows subscription windows with service lanes
- Upcoming Releases lists content with taste match scores

**Watch Queue** fully functional:
- Add content via "Add to Queue" button
- Items appear in Watch Queue section
- Duplicate handling with friendly messages
- Remove items via queue controls

## License

MIT

## Contributing

Contributions welcome! Please read the development workflow in [AI_PLAN.md](AI_PLAN.md) before submitting PRs.
