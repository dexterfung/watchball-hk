<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0 (MINOR — five targeted amendments based on
  confirmed operator context: solo developer, manual weekly entry, custom admin UI,
  free-tier database, all HK TV/OTT competitions in scope)

Modified principles:
  - I. Schedule Correctness → monitoring clause scoped to automation level;
      build/deploy notification sufficient when no automated ingestion exists
  - III. Simple, Maintainable Architecture → "handle match-day spikes" replaced
      with static/cached asset serving requirement; admin UI requirement made
      concrete (custom-built, database-backed, fast entry UX mandatory);
      free-tier database constraint added; deployment unit cap relaxed to
      reflect real solo-operator architecture

Modified sections:
  - Product Scope → competition scope made explicit: ALL matches airing on
      HK TV/OTT; no competition excluded by default

Added rules:
  - Admin UI MUST support fast bulk entry (pre-populated fields, keyboard
      navigation, copy-forward for recurring fixtures)

Removed rules:
  - "match-day spike / horizontal scaling" — moot with static/cached serving
  - "monitoring dashboard" as a Phase 1 requirement — disproportionate for
      solo operator with manual ingestion

Templates reviewed:
  - .specify/templates/plan-template.md ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ✅ compatible (admin UI tasks now
      include entry-efficiency requirements)

Follow-up TODOs: none.
-->

# WatchBall HK Constitution

## Product Scope (v1)

WatchBall HK is a **TV and OTT broadcast schedule guide for football matches in Hong Kong**.
The following are firm v1 boundaries — they MUST NOT be crossed unless a deliberate,
documented scope change is approved and this section is amended:

- **In scope**: broadcast schedules (TV channels and OTT platforms) for **all football
  matches airing on HK TV/OTT**. No competition is excluded by default. Match metadata
  includes: teams, competition, kick-off time in HKT, and broadcaster(s).
- **Out of scope (v1)**: live scores or match updates, betting odds or links, links to
  unauthorised or illegal streams, user accounts or personalisation beyond local filter
  state.

Any feature that touches out-of-scope areas MUST be rejected at spec review.

## Core Principles

### I. Schedule Correctness (NON-NEGOTIABLE)

Schedule data displayed to users MUST be accurate at all times. Displaying an incorrect
kick-off time or wrong broadcast channel is strictly worse than showing no data —
it causes users to miss matches entirely and destroys trust.

- **Timezone**: All times MUST be stored in UTC internally and displayed exclusively in
  Hong Kong Time (HKT, UTC+8). No other timezone MUST be exposed in the UI.
- **Record metadata**: Every match record MUST carry:
  - `source_type` — one of: `manual`, `scraper`, `api`, `import`
  - `last_updated` — ISO 8601 timestamp of most recent verified update
  - `confidence` — one of: `confirmed`, `unconfirmed`, `estimated`
- **Display rules**: Records with `confidence: unconfirmed` or `confidence: estimated`
  MUST be visually flagged (e.g., 待確認 / "Unconfirmed") so users know to verify
  independently. Stale records (last_updated older than a configurable staleness
  threshold) MUST be hidden or flagged — never silently presented as current.
- **Graceful fallbacks**: When a match record is missing broadcast information, the UI
  MUST render a "broadcaster unknown" / 待確認 state rather than crashing or hiding
  the match entirely.
- **Ingestion monitoring**: Monitoring requirements are proportionate to the ingestion
  method in use:
  - *Manual ingestion only (Phase 1 default)*: A build/deploy success notification
    (e.g., email from the hosting platform) is sufficient. No dedicated monitoring
    service is required.
  - *Any automated ingestion source*: MUST emit a health signal (success count,
    failure count, last run time) to an operator-visible alert channel before going
    live in production. Silent automation failures are not acceptable.
- **Corrections**: A corrected schedule entry MUST propagate to all cached and rendered
  views within one build/deploy cycle. Caches MUST be invalidatable on demand by the
  operator.

**Rationale**: Users open this app minutes before kick-off. A wrong time or channel
causes real harm. The confidence and metadata model lets us ship partial data safely
without deceiving users. Monitoring requirements scale with automation complexity —
over-instrumenting a manual workflow adds cost without benefit.

### II. Responsive Web-First UX

The product MUST deliver a fast, clear, and accessible experience on both mobile and
desktop browsers. All UI decisions MUST be validated at both viewport sizes.

- **Language**: Traditional Chinese (廣東話書寫) is the primary display language.
  English MUST be provided as a secondary label where it adds clarity (e.g., team
  names, competition names). The UI MUST never be English-only.
- **Filters**: The schedule view MUST expose, at minimum, filters for: **date**,
  **competition/tournament**, and **team**. Filters MUST be usable on mobile without
  horizontal scrolling.
- **Viewports**: Layouts MUST be readable and actionable on screens as narrow as 375px
  (iPhone SE) and as wide as 1440px. Touch targets MUST be at least 44×44px.
- **Performance**: Page loads MUST target under 1 second (LCP) on a mid-range mobile
  device on a 4G connection. Schedule pages MUST be served as static or heavily cached
  assets (via CDN) so that concurrent read traffic — including match-day spikes — does
  not require server-side scaling. Static assets (JS, CSS, images, fonts) MUST be
  served via a CDN.
- **PWA**: Phase 1 delivery MUST be a Progressive Web App: installable on iOS/Android
  home screens, and capable of displaying the most recently cached schedule offline.
- **Native app**: A dedicated native mobile app is out of scope for Phase 1 and MUST
  NOT be designed or built until a Phase 2 decision is formally documented.

**Rationale**: The audience is HK football fans, predominantly Cantonese speakers
checking schedules on their phone. Sub-1s loads and Traditional Chinese copy are
table-stakes for this demographic. Serving static/cached pages means match-day traffic
peaks are handled by CDN infrastructure, not application scaling.

### III. Simple, Maintainable Architecture

The codebase MUST be understandable to a single developer returning after 3 months away.
Complexity MUST be justified by a concrete, present need.

- **Three-layer separation**: The system MUST maintain clear boundaries between:
  1. **Data ingestion layer** — the admin UI and any future scripts or importers that
     write to the database. No direct coupling to the public UI.
  2. **API / data-serving layer** — reads from the database and serves schedule data
     to the frontend (or generates static output). No ingestion logic.
  3. **UI layer** — renders schedule data, handles filters, PWA shell. No direct
     database access.
- **Admin UI**: A custom-built admin interface MUST be included in Phase 1. It is the
  sole operator interface for creating, editing, deleting, and flagging schedule records.
  The admin UI MUST be backed by the project database (no separate data store).
  The admin UI MUST be designed for fast data entry, specifically:
  - Pre-populated dropdowns for competitions, teams, channels, and broadcasters
    (no free-text where a known value exists)
  - Keyboard-navigable forms (tab between fields; submit without mouse)
  - Copy-forward for recurring fixtures (e.g., "same time, same channel as last week")
  - Bulk entry mode or multi-record creation in a single flow
- **Database**: The project MUST use a relational database (Postgres or compatible)
  with a free tier sufficient for Phase 1 scale. The database MUST NOT require a paid
  plan to operate the live product during Phase 1.
- **Deployment units**: The project targets two deployment units in Phase 1: (1) the
  frontend/PWA and (2) the backend (API + admin UI + database). Additional units require
  documented justification in the plan's Complexity Tracking table.
- **Dependencies**: Each new dependency requires a brief written rationale before
  inclusion. Prefer established, well-maintained libraries.
- **YAGNI**: No abstractions, layers, or services MUST be introduced speculatively.

**Rationale**: A clean three-layer separation means data entry bugs don't affect the
public UI, and UI changes don't risk data integrity. The admin UI entry-efficiency
requirements exist because the operator is also the sole developer — slow data entry
directly competes with development time. Free-tier database keeps Phase 1 cost at zero.

### IV. Gradual Data Automation

Data ingestion automation MUST be introduced incrementally, beginning with the simplest
viable approach and adding automation only where manual effort is demonstrably
unsustainable.

- Phase 1 ingestion is fully manual via the admin UI. This is the deliberate starting
  point.
- Every ingestion source (manual entry, future scraper, future external API) MUST
  populate the `source_type`, `last_updated`, and `confidence` fields defined in
  Principle I. These are part of the ingestion contract and MUST NOT be optional.
- Automation steps MUST be introduced one at a time, each requiring a documented
  trigger (e.g., "manual entry exceeds 2 hours/week") before implementation begins.
- Scrapers and third-party API integrations MUST include a fallback to manual override
  via the admin UI, so Principle I can always be upheld when automation fails.
- Ingestion failure monitoring (Principle I) MUST be operational before any automated
  ingestion source goes live in production.
- Automation code MUST be tested against fixture data before connecting to live sources.

**Rationale**: Premature automation silently corrupts schedule data — the worst possible
outcome for this product. Manual-first preserves data quality while the operator learns
what is actually worth automating.

### V. Incremental Feature Delivery

Features MUST be shipped in independently testable, independently deployable increments.
No feature branch MUST block the main branch from being releasable.

- Each increment MUST deliver user-visible value on its own (no "80% done" shipped
  states).
- The MVP for each feature is the minimum that satisfies its highest-priority user story.
- Feature flags or environment variables MUST be used for work-in-progress that must
  merge to main before completion.
- The Product Scope boundary (above) MUST be checked at every increment — scope creep
  MUST be caught at spec review, not after implementation.

**Rationale**: A TV guide that is partially broken is still usable if breakage is
isolated. Incremental delivery keeps the product shippable and surfaces integration
issues early.

## Platform Strategy

- **Phase 1 (current)**: PWA delivered via a web stack. Installable on iOS and Android
  home screens. Offline support for most-recently-cached schedule via service worker.
- **Phase 2 (future, not yet decided)**: Native iOS and/or Android application.
  This MUST be driven by a documented user need the PWA cannot fulfil (e.g., push
  notifications, home-screen widgets). No Phase 2 work MUST be introduced into Phase 1
  architecture.

Architectural decisions that would complicate a future native-app migration MUST be
flagged in the plan's Complexity Tracking table with a migration note.

## Development Workflow

- All features begin with a spec (`spec.md`) and implementation plan (`plan.md`) before
  any code is written.
- Constitution Check in `plan.md` MUST be completed before Phase 0 research begins.
  The check MUST explicitly address: HKT handling, 3-layer separation, confidence-level
  schema, admin UI scope (including entry-efficiency), and CDN/caching approach.
- Schedule data changes (ingestion scripts, schema, source configs) MUST be reviewed
  separately from UI changes to preserve Principle I integrity.
- Pull requests MUST NOT mix data-layer changes with presentation-layer changes unless
  inseparably coupled (documented justification required).
- Any feature touching Product Scope boundaries MUST be flagged in the spec and approved
  before implementation.

## Governance

This Constitution supersedes all other practices, conventions, and prior agreements
within the WatchBall HK project. Amendments require:

1. A written proposal stating the principle or section being changed and the motivation.
2. A version bump following the versioning policy below.
3. A migration note for any existing features or code affected by the change.

**Versioning policy**:
- MAJOR bump: removal or backward-incompatible redefinition of an existing principle,
  or removal of the Product Scope section's firm boundaries.
- MINOR bump: new principle or section added; material expansion of existing guidance.
- PATCH bump: clarification, wording improvement, typo fix.

**Compliance review**: Every plan's Constitution Check section MUST list each principle
by name and confirm compliance or document a justified exemption. Non-compliance without
documented justification is grounds to block implementation.

**Version**: 1.2.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
