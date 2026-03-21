# Tasks: 賽程管理後台

**Input**: Design documents from `/specs/002-schedule-admin/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-api.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Dependency**: This feature builds on top of spec 001 (public schedule). Spec 001's Setup and Foundational phases MUST be complete before starting this feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Admin-Specific Dependencies)

**Purpose**: Install admin-specific dependencies and restructure routing for admin/public separation

- [ ] T001 Install admin dependencies: @headlessui/react, react-hook-form, and @supabase/ssr (if not already installed from spec 001)
- [ ] T002 Restructure existing spec 001 pages into route group: move src/app/page.tsx and src/app/layout.tsx into src/app/(public)/ route group; create new src/app/layout.tsx as root layout (shared by both public and admin); verify public schedule still works at /. ⚠️ This modifies spec 001 file structure — must be performed after merging the latest 001-hk-tv-schedule branch to avoid conflicts
- [ ] T003 [P] Create admin TypeScript types in src/lib/types.ts: add CreateMatchInput, CreateMatchResult, UpdateMatchInput, UpdateMatchResult, DeleteMatchInput, DeleteMatchResult, InvalidationResult, CreateReferenceInput/Result, and DeleteReferenceInput/Result interfaces per contracts/admin-api.md

---

## Phase 2: Foundational (Auth & Admin Infrastructure)

**Purpose**: Authentication, route protection, admin layout, and database write policies that ALL admin user stories depend on

**⚠️ CRITICAL**: No admin user story work can begin until this phase is complete

- [ ] T004 Create RLS write policies migration in supabase/migrations/002_admin_rls.sql: add INSERT/UPDATE/DELETE policies for authenticated role on matches, competitions, teams, broadcasters, and match_broadcasters tables per data-model.md
- [ ] T005 [P] Create Supabase browser client in src/lib/supabase/client.ts: createBrowserClient from @supabase/ssr for client-side auth operations (login, session management)
- [ ] T006 [P] Create Supabase auth middleware helper in src/lib/supabase/middleware.ts: createServerClient with cookie handling for middleware session refresh
- [ ] T007 Create Next.js middleware in src/middleware.ts: match /admin/* routes (except /admin/login), use @supabase/ssr to refresh session cookie, call supabase.auth.getUser() to verify auth, redirect unauthenticated requests to /admin/login; pass through all other routes unchanged
- [ ] T008 Create admin login page in src/app/(admin)/admin/login/page.tsx: email/password form using Supabase Auth signInWithPassword(); redirect to /admin on success; show inline error on failure; English UI
- [ ] T009 Create admin layout in src/app/(admin)/layout.tsx: admin shell with top bar (navigation to /admin and /admin/reference, "Publish Changes" button placeholder, logout button calling supabase.auth.signOut()); English UI; desktop-optimised layout
- [ ] T010 Create admin match data fetching function in src/lib/admin.ts: fetchAdminMatches(dateRange) that queries Supabase for matches within a date range (HKT) with all joins (same as spec 001 query but for admin list view); fetchReferenceData() that loads all competitions, teams, and broadcasters for dropdown population

**Checkpoint**: Auth flow works (login → admin → logout), middleware blocks unauthenticated access, RLS policies enforce write protection, reference data loads for dropdowns

---

## Phase 3: User Story 1 — 建立新賽事記錄 (Priority: P1) 🎯 MVP

**Goal**: Operator can create a match record using a keyboard-navigable form with searchable dropdowns, and the form resets for the next entry after submission

**Independent Test**: Log in to admin, fill out all fields using keyboard only (tab, type, arrow, enter), submit → record appears in Supabase matches table with correct UTC time, source_type='manual', and last_updated set. Form clears for next entry.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create SearchableCombobox component in src/components/admin/SearchableCombobox.tsx: wraps Headless UI Combobox with type-to-filter, arrow key navigation, Enter to select; accepts options array and onChange callback; integrates with React Hook Form via Controller; single-select mode
- [ ] T012 [P] [US1] Create MultiSelectCombobox component in src/components/admin/MultiSelectCombobox.tsx: wraps Headless UI Combobox with multiple prop; displays selected items as removable chips; Backspace removes last selection; integrates with React Hook Form Controller
- [ ] T013 [P] [US1] Create ConfidenceSelect component in src/components/admin/ConfidenceSelect.tsx: simple select with exactly 3 options (confirmed, unconfirmed, estimated); defaults to 'confirmed'; keyboard-navigable
- [ ] T014 [P] [US1] Create DateTimePicker component in src/components/admin/DateTimePicker.tsx: separate date (type="date") and time (type="time", 24h format) inputs; date defaults to today (HKT); both fields keyboard-navigable via native input controls
- [ ] T015 [US1] Create MatchForm component in src/components/admin/MatchForm.tsx: React Hook Form with field order per plan (date → time → home team → away team → competition → broadcaster(s) → confidence → submit); uses SearchableCombobox for teams/competition, MultiSelectCombobox for broadcasters, ConfidenceSelect, DateTimePicker; inline validation (required fields: date, time, home team, away team, competition); form resets after successful submit without page reload; accepts optional initialValues prop for edit/copy-forward pre-filling
- [ ] T016 [US1] Create createMatch server action in src/app/(admin)/actions/matches.ts: validates input, converts HKT date+time to UTC via Date API (${date}T${time}:00+08:00), inserts into matches table with source_type='manual' and last_updated=now(), inserts match_broadcasters rows, checks for duplicate (same teams + same kick_off_utc) and returns duplicateWarning if found; verifies user session before executing
- [ ] T017 [US1] Create admin main page in src/app/(admin)/admin/page.tsx: two-panel desktop layout — left panel (60%) with MatchForm, right panel (40%) with match list for selected date range; loads reference data for dropdowns on mount; wires MatchForm onSubmit to createMatch server action; shows success/error feedback; match list refreshes after create
- [ ] T018 [US1] Create MatchList component in src/components/admin/MatchList.tsx: displays matches for selected date range as a list; each row shows match summary (time HKT, home vs away, competition, broadcasters, confidence); includes date range selector at top; action buttons per row (Edit, Copy Forward, Delete) rendered as placeholders for now

**Checkpoint**: MVP complete — operator can log in and create match records using keyboard-only flow. Records appear in database with correct UTC time. Form resets after each entry.

---

## Phase 4: User Story 2 — 批量錄入同一場次 (Priority: P2)

**Goal**: Operator can copy-forward a previous match entry, pre-filling the form with time, competition, and broadcasters from the source record, with date +7 days

**Independent Test**: Click "Copy Forward" on an existing match row → form pre-fills with source's time, competition, broadcasters; date is +7 days; home/away team fields are empty and focused. Save with only team changes → new record created correctly.

### Implementation for User Story 2

- [ ] T019 [US2] Create copy-forward logic in src/lib/admin.ts: getCopyForwardData(matchId) function that fetches source match's kick_off_utc (converted to HKT), competition_id, and broadcaster_ids; calculates date +7 days; returns partial form values (date, time, competitionId, broadcasterIds) with homeTeamId and awayTeamId left undefined
- [ ] T020 [US2] Wire copy-forward into admin page in src/app/(admin)/admin/page.tsx: when "Copy Forward" action is triggered on a MatchRow, call getCopyForwardData(), pass result as initialValues to MatchForm, and set focus to the home team field (first empty field)

**Checkpoint**: Copy-forward reduces repeat entry to 2 field changes (home team, away team). Date auto-advances by 7 days.

---

## Phase 5: User Story 3 — 編輯已發佈記錄及更新緩存 (Priority: P3)

**Goal**: Operator can edit any field of an existing match and trigger cache invalidation so changes appear on the public site within 30 seconds

**Independent Test**: Click "Edit" on a match → form populates with all current values. Change broadcaster, save → record updated in DB with new last_updated. Click "Publish Changes" → public schedule reflects the change.

### Implementation for User Story 3

- [ ] T021 [US3] Create updateMatch server action in src/app/(admin)/actions/matches.ts: validates input, updates only provided fields, sets last_updated=now(), replaces match_broadcasters if broadcasterIds provided; verifies user session
- [ ] T022 [US3] Wire edit flow into admin page in src/app/(admin)/admin/page.tsx: when "Edit" action is triggered on a MatchRow, load full match data into MatchForm as initialValues (all fields populated); on submit, call updateMatch instead of createMatch; match list refreshes after update
- [ ] T023 [P] [US3] Create triggerCacheInvalidation server action in src/app/(admin)/actions/revalidate.ts: calls POST /api/revalidate?secret=<REVALIDATION_SECRET> using server-side environment variable; returns InvalidationResult
- [ ] T024 [US3] Create CacheInvalidateButton component in src/components/admin/CacheInvalidateButton.tsx: "Publish Changes" button that calls triggerCacheInvalidation server action; shows loading state during request; displays success toast ("Changes published") or error toast ("Failed to publish — retry") on completion
- [ ] T025 [US3] Integrate CacheInvalidateButton into admin layout top bar in src/app/(admin)/layout.tsx; add auto-suggestion toast after any save/edit/delete: "Changes saved. Publish to update the public site."

**Checkpoint**: Edit + invalidation flow works end-to-end. Changes propagate to public site within 30 seconds of "Publish Changes".

---

## Phase 6: User Story 4 — 刪除賽事記錄 (Priority: P4)

**Goal**: Operator can delete a match record with explicit confirmation

**Independent Test**: Click "Delete" on a match → confirmation dialog appears. Confirm → record removed from DB. Cancel → no change. Publish → removed from public site.

### Implementation for User Story 4

- [ ] T026 [P] [US4] Create DeleteConfirmDialog component in src/components/admin/DeleteConfirmDialog.tsx: modal dialog showing match summary (teams, date, time); "Delete" and "Cancel" buttons; keyboard-navigable (Escape closes, Enter confirms when Delete is focused)
- [ ] T027 [US4] Create deleteMatch server action in src/app/(admin)/actions/matches.ts: validates matchId, deletes match row (match_broadcasters cascade-deleted via FK); verifies user session
- [ ] T028 [US4] Wire delete flow into admin page in src/app/(admin)/admin/page.tsx: when "Delete" action is triggered on a MatchRow, show DeleteConfirmDialog; on confirm, call deleteMatch server action; refresh match list on success; show auto-suggestion toast to publish changes

**Checkpoint**: Delete with confirmation works. Cascade deletes match_broadcasters. No accidental deletions possible.

---

## Phase 7: User Story 5 — 管理參考資料 (Priority: P5)

**Goal**: Operator can add new competitions, teams, and broadcasters to reference lists so they appear in form dropdowns

**Independent Test**: Navigate to /admin/reference, add a new broadcaster → it immediately appears in the broadcaster dropdown on the match entry form. Adding a duplicate name shows an error.

### Implementation for User Story 5

- [ ] T029 [US5] Create createReferenceItem and deleteReferenceItem server actions in src/app/(admin)/actions/reference.ts: createReferenceItem accepts type (competition/team/broadcaster) and name fields per CreateReferenceInput contract; inserts into the correct table; returns error on duplicate name (unique constraint violation). deleteReferenceItem accepts type and id; checks for referencing matches before deleting (returns error if referenced); verifies user session on both actions
- [ ] T030 [US5] Create ReferenceManager component in src/components/admin/ReferenceManager.tsx: tabbed UI with three tabs (Competitions, Teams, Broadcasters); each tab shows existing items as a list with a delete button per item, and an "Add" form at the top; competition/team form has nameZh (required) and nameEn (optional); broadcaster form has name (required) and type select (tv/ott); shows inline error on duplicate; new items appear in list immediately after adding
- [ ] T031 [US5] Create reference data management page in src/app/(admin)/admin/reference/page.tsx: renders ReferenceManager component; fetches current reference data from Supabase on load

**Checkpoint**: Reference data management works. New items appear in match form dropdowns without page reload.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: UX refinements, edge case handling, and validation across all stories

- [ ] T032 Add duplicate detection warning to MatchForm in src/components/admin/MatchForm.tsx: when createMatch returns duplicateWarning, show a warning dialog with the existing match details; allow operator to proceed or cancel
- [ ] T033 [P] Add keyboard navigation polish: verify tab order across entire admin page (form fields → submit → match list actions); ensure Escape closes all dialogs/dropdowns; ensure Enter submits form when submit button is focused
- [ ] T034 [P] Add toast notification system to admin layout in src/app/(admin)/layout.tsx: lightweight toast component for success/error/info messages; used by create/edit/delete/invalidation feedback and auto-suggestion prompts
- [ ] T035 Add referential integrity handling for reference deletion in src/components/admin/ReferenceManager.tsx: when operator tries to delete a reference item, check if it's referenced by existing matches; if yes, show warning "This item is used by X matches and cannot be deleted"; block deletion
- [ ] T036 Validate quickstart.md end-to-end for admin: create admin user in Supabase dashboard, apply RLS migration, log in at /admin/login, create a match, edit it, copy-forward, delete, manage reference data, publish changes, verify public site updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Depends on spec 001's Setup and Foundational phases being complete
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all admin user stories
- **US1 (Phase 3)**: Depends on Foundational — delivers admin MVP
- **US2 (Phase 4)**: Depends on US1 (MatchForm and MatchList exist)
- **US3 (Phase 5)**: Depends on US1 (MatchForm edit mode, match list)
- **US4 (Phase 6)**: Depends on US1 (MatchList with action buttons)
- **US5 (Phase 7)**: Independent of US2–US4 (only adds reference management page and server action)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other admin stories — standalone admin MVP
- **US2 (P2)**: Requires US1's MatchForm (for pre-filling) and MatchList (for Copy Forward button)
- **US3 (P3)**: Requires US1's MatchForm (for edit mode) and MatchList (for Edit button)
- **US4 (P4)**: Requires US1's MatchList (for Delete button)
- **US5 (P5)**: Independent — separate page, separate server action; can run in parallel with US2–US4

### Parallel Opportunities

**Within Phase 1**: T003 can run in parallel with T002
**Within Phase 2**: T005, T006 can run in parallel; then T007 (depends on T006)
**Within US1**: T011, T012, T013, T014 can run in parallel (leaf components); then T015 (depends on all four)
**US5 can run in parallel with US2, US3, US4** (separate page, no shared components)
**Within US3**: T023 can run in parallel with T021
**Within US4**: T026 can run in parallel with other US4 setup
**Within Polish**: T033, T034 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all leaf form components together:
Task: "Create SearchableCombobox in src/components/admin/SearchableCombobox.tsx"
Task: "Create MultiSelectCombobox in src/components/admin/MultiSelectCombobox.tsx"
Task: "Create ConfidenceSelect in src/components/admin/ConfidenceSelect.tsx"
Task: "Create DateTimePicker in src/components/admin/DateTimePicker.tsx"

# Then compose the form:
Task: "Create MatchForm in src/components/admin/MatchForm.tsx"

# Then build the server action and page:
Task: "Create createMatch server action in src/app/(admin)/actions/matches.ts"
Task: "Create admin main page in src/app/(admin)/admin/page.tsx"
Task: "Create MatchList in src/components/admin/MatchList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install deps, restructure routes)
2. Complete Phase 2: Foundational (auth, middleware, RLS, admin layout)
3. Complete Phase 3: User Story 1 (create match form)
4. **STOP and VALIDATE**: Log in, create a match via keyboard-only, verify in DB
5. Deploy — admin MVP is live alongside public schedule

### Incremental Delivery

1. Setup + Foundational → Admin infrastructure ready
2. Add US1 (create) → Test → Deploy (Admin MVP!)
3. Add US2 (copy-forward) → Test → Deploy
4. Add US3 (edit + invalidation) → Test → Deploy
5. Add US4 (delete) → Test → Deploy
6. Add US5 (reference data) — can be done in parallel with US2–US4
7. Polish → Final validation → Deploy

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- This feature assumes spec 001's database schema and revalidation endpoint are already deployed
- Admin language is English (per spec assumption — sole operator is the developer)
- All server actions verify user session before executing (per auth contract)
- Total: 36 tasks across 8 phases
