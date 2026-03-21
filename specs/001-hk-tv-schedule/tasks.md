# Tasks: 香港足球電視直播時間表

**Input**: Design documents from `/specs/001-hk-tv-schedule/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted. Tests can be added later via a separate pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and tooling

- [ ] T001 Initialize Next.js 15 project with App Router, TypeScript, pnpm, and ESLint in repository root
- [ ] T002 Install core dependencies: @supabase/supabase-js, @supabase/ssr, @serwist/next, @serwist/precaching, @serwist/sw
- [ ] T003 [P] Create .env.local.example with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, REVALIDATION_SECRET placeholders
- [ ] T004 [P] Configure Vitest in vitest.config.ts and Playwright in playwright.config.ts with pnpm test and pnpm test:e2e scripts in package.json
- [ ] T005 [P] Add --webpack flag to build script in package.json (required for Serwist with Next.js 16+ Turbopack default)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Supabase client, shared types, and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create database migration in supabase/migrations/001_initial_schema.sql with all 5 tables (competitions, teams, broadcasters, matches, match_broadcasters), indexes, constraints, and RLS read policies per data-model.md
- [ ] T007 Create seed data script in supabase/seed.sql with HK competitions (英超, 西甲, 意甲, 德甲, 法甲, 歐冠, 歐霸, etc.), broadcasters (Now TV, Now E, ViuTV, ESPN, beIN Sports, etc.), and sample matches for testing
- [ ] T008 [P] Create Supabase server client helper in src/lib/supabase/server.ts using createClient with anon key for Server Component data fetching
- [ ] T009 [P] Create shared TypeScript types in src/lib/types.ts matching the SchedulePageData, MatchEntry, TeamInfo, CompetitionInfo, BroadcasterInfo, and FilterOption interfaces from contracts/api.md
- [ ] T010 [P] Create HKT date utility functions in src/lib/date.ts: formatTimeHKT (UTC→HKT display), formatDateHKT (date display), getHKTDateRange (selected HKT date→UTC start/end for Supabase query), getTodayHKT (current date in HKT)
- [ ] T011 Create schedule data fetching function in src/lib/schedule.ts: fetchScheduleByDate(date: string) that queries Supabase for matches within the HKT date range, joins home_team, away_team, competition, and broadcasters, orders by kick_off_utc ascending, and returns SchedulePageData shape
- [ ] T012 Create revalidation API route in src/app/api/revalidate/route.ts: POST handler that validates REVALIDATION_SECRET, calls revalidatePath('/'), and returns JSON response per contracts/api.md

**Checkpoint**: Database ready, Supabase connected, data fetching works, revalidation endpoint live

---

## Phase 3: User Story 1 — 查看今日賽事直播 (Priority: P1) 🎯 MVP

**Goal**: User opens the page and sees today's football TV schedule with match times (HKT), teams (Chinese + English), competition, broadcasters, confidence badges, and graceful fallbacks

**Independent Test**: Load the page; today's schedule displays with all match data fields. Matches with no broadcaster show 待定. Unconfirmed matches show 待確認. Empty day shows empty-state message.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create MatchCard component in src/components/schedule/MatchCard.tsx: displays kick-off time (HKT), home vs away team (nameZh primary, nameEn secondary), competition (nameZh primary, nameEn secondary), broadcaster name(s), and confidence badge; shows 待定 fallback when broadcasters array is empty
- [ ] T014 [P] [US1] Create ConfidenceBadge component in src/components/schedule/ConfidenceBadge.tsx: renders 待確認 badge for confidence values 'unconfirmed' or 'estimated'; renders nothing for 'confirmed'
- [ ] T015 [P] [US1] Create EmptyState component in src/components/schedule/EmptyState.tsx: displays a Traditional Chinese message (今日暫無賽事直播) when no matches are available; accepts optional custom message and clear-filters action
- [ ] T016 [US1] Create MatchList client component in src/components/schedule/MatchList.tsx: receives MatchEntry[] as props, renders MatchCard for each match ordered by kick-off time; shows EmptyState when array is empty
- [ ] T017 [US1] Create root layout in src/app/layout.tsx: set lang="zh-Hant-HK", add Traditional Chinese metadata (title: 香港足球電視直播時間表), import fonts, add viewport meta for mobile
- [ ] T018 [US1] Create schedule page in src/app/page.tsx: Server Component that reads searchParams.date (defaults to getTodayHKT()), calls fetchScheduleByDate(), passes SchedulePageData to MatchList client component; configure ISR with revalidate: false (on-demand only)

**Checkpoint**: MVP complete — today's schedule renders with all data fields, fallbacks, and confidence badges. Independently testable and deployable.

---

## Phase 4: User Story 2 — 按日期瀏覽賽程 (Priority: P2)

**Goal**: User can navigate forward and backward by day to view other dates' schedules

**Independent Test**: On the schedule page, tap forward → tomorrow's matches load; tap backward → yesterday's matches load. Date indicator updates. Default is today (HKT).

### Implementation for User Story 2

- [ ] T019 [US2] Create DateNavigator component in src/components/schedule/DateNavigator.tsx: displays current selected date in Traditional Chinese (e.g., 3月14日 星期五), with left/right arrow buttons for previous/next day; navigates by updating ?date= search param via router.push; touch targets ≥44×44px; no horizontal scrolling on mobile
- [ ] T020 [US2] Integrate DateNavigator into the schedule page layout in src/app/page.tsx: render DateNavigator above MatchList, pass current date as prop

**Checkpoint**: Date navigation works. Users can browse forward 30 days and backward 7 days from today.

---

## Phase 5: User Story 3 — 按賽事或球隊篩選 (Priority: P3)

**Goal**: User can filter matches by competition and/or team within the selected date

**Independent Test**: Select a competition filter → only matches from that competition show. Select a team filter → only matches involving that team show. Both active → AND logic. Clear filters → all matches return.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Create FilterBar component in src/components/schedule/FilterBar.tsx: renders competition and team filter dropdowns using native <select> elements (mobile-friendly, no horizontal scroll); derives options from the matches on the current date; includes a "清除篩選" (clear filters) action; all labels in Traditional Chinese
- [ ] T022 [US3] Add client-side filtering logic to MatchList in src/components/schedule/MatchList.tsx: accept activeCompetitionId and activeTeamId filter state; filter matches by AND logic (match must satisfy all active filters); show EmptyState with clear-filters action when filters yield no results
- [ ] T023 [US3] Integrate FilterBar into the schedule page layout in src/app/page.tsx: pass filters.competitions and filters.teams from SchedulePageData as options; wire filter state between FilterBar and MatchList via React useState in a shared client wrapper

**Checkpoint**: Filters work on mobile without horizontal scrolling. AND logic correct. Empty filtered state shows clear option.

---

## Phase 6: User Story 4 — 離線查看賽程 (Priority: P4)

**Goal**: Previously loaded schedule is viewable offline with an offline indicator

**Independent Test**: Load the page online, then disable network and reload → cached schedule is visible. 離線模式 banner appears.

### Implementation for User Story 4

- [ ] T024 [US4] Create Serwist service worker in src/sw.ts: configure precaching for app shell (HTML, CSS, JS, fonts, icons); add NetworkFirst runtime caching for schedule page navigations; add CacheFirst for static assets (_next/static/*)
- [ ] T025 [US4] Configure @serwist/next in next.config.ts: set swSrc to src/sw.ts, swDest to public/sw.js, enable cacheOnNavigation and reloadOnOnline in production only
- [ ] T026 [US4] Create OfflineBanner component in src/components/schedule/OfflineBanner.tsx: listens to navigator.onLine events; when offline, displays a Traditional Chinese banner (離線模式 — 顯示最近緩存資料) at the top of the page; auto-hides when connection restores
- [ ] T027 [US4] Add OfflineBanner to root layout in src/app/layout.tsx: render above main content area so it appears globally when offline

**Checkpoint**: Offline viewing works after prior online visit. Banner indicates offline status. Schedule data served from service worker cache.

---

## Phase 7: User Story 5 — 安裝為主畫面應用程式 (Priority: P5)

**Goal**: PWA is installable on iOS and Android home screens, launches in standalone mode

**Independent Test**: On Android Chrome, install prompt appears or user can Add to Home Screen. On iOS Safari, Share → Add to Home Screen works. App launches without browser chrome.

### Implementation for User Story 5

- [ ] T028 [P] [US5] Create PWA manifest in src/app/manifest.ts: name "WatchBall HK 香港足球直播表", short_name "WatchBall", display "standalone", theme_color, background_color, start_url "/", icons (192x192 and 512x512)
- [ ] T029 [P] [US5] Create PWA icons in src/public/icons/: generate icon-192x192.png and icon-512x512.png with WatchBall HK branding
- [ ] T030 [US5] Add Apple PWA meta tags to root layout in src/app/layout.tsx: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-touch-icon link

**Checkpoint**: PWA installable on both platforms. Launches in standalone mode from home screen.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Responsive refinement, performance, error handling

- [ ] T031 Add error boundary and loading state to src/app/page.tsx: show Traditional Chinese error message (無法載入賽程資料) when Supabase fetch fails and no cache exists; add loading skeleton for ISR regeneration
- [ ] T032 [P] Responsive CSS polish across all components: verify layout at 375px (iPhone SE) and 1440px (desktop); ensure touch targets ≥44×44px; verify no horizontal scrolling on any filter or navigation control
- [ ] T033 [P] Add staleness flagging in MatchCard: if match.lastUpdated is older than STALENESS_THRESHOLD_DAYS env var (default 7), show a subtle stale indicator alongside the match entry
- [ ] T034 Validate quickstart.md end-to-end: follow all steps from a clean checkout, verify dev server runs, seed data loads, schedule page renders, date navigation works, filters work, revalidation endpoint responds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — delivers MVP
- **US2 (Phase 4)**: Depends on Foundational + US1 (page.tsx exists)
- **US3 (Phase 5)**: Depends on Foundational + US1 (MatchList exists)
- **US4 (Phase 6)**: Depends on Foundational + US1 (app shell exists to cache)
- **US5 (Phase 7)**: Depends on Setup (can run in parallel with US2–US4 since it only touches manifest/icons/layout)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — standalone MVP
- **US2 (P2)**: Extends page.tsx from US1 (adds DateNavigator)
- **US3 (P3)**: Extends MatchList from US1 (adds filter state)
- **US4 (P4)**: Requires app shell from US1 to exist (service worker caches it)
- **US5 (P5)**: Independent of US2–US4 (only adds manifest, icons, meta tags)

### Parallel Opportunities

**Within Phase 1**: T003, T004, T005 can run in parallel
**Within Phase 2**: T008, T009, T010 can run in parallel; then T011 (depends on T008, T009, T010)
**Within US1**: T013, T014, T015 can run in parallel; then T016 (depends on T013, T014, T015)
**US5 can run in parallel with US2, US3, US4** (touches different files)
**Within Polish**: T032, T033 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all leaf components for US1 together:
Task: "Create MatchCard component in src/components/schedule/MatchCard.tsx"
Task: "Create ConfidenceBadge component in src/components/schedule/ConfidenceBadge.tsx"
Task: "Create EmptyState component in src/components/schedule/EmptyState.tsx"

# Then compose them:
Task: "Create MatchList client component in src/components/schedule/MatchList.tsx"

# Then build the page:
Task: "Create root layout in src/app/layout.tsx"
Task: "Create schedule page in src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Load the page, verify schedule renders with all fields, fallbacks, badges
5. Deploy to Vercel — MVP is live

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy (MVP!)
3. Add US2 (date nav) → Test → Deploy
4. Add US3 (filters) → Test → Deploy
5. Add US4 (offline) + US5 (PWA) in parallel → Test → Deploy
6. Polish → Final validation → Deploy

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Foundational phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 34 tasks across 8 phases
