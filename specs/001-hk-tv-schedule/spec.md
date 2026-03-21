# Feature Specification: 香港足球電視直播時間表

**Feature Branch**: `001-hk-tv-schedule`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "A public-facing football TV schedule page for Hong Kong viewers. Users land on a schedule listing showing all upcoming football matches broadcast on HK TV or OTT platforms. Each match entry displays: kick-off time in HKT, home team vs away team, competition name, and the broadcaster/channel(s) showing it. If a match is unconfirmed or estimated, it must be visually flagged (待確認). If broadcaster info is missing, show a graceful fallback rather than hiding the match. The page must have filters for: date (default to today, browse forward/backward by day), competition/tournament, and team. Filters must work on mobile without horizontal scrolling. Traditional Chinese is the primary language throughout. English appears as secondary labels on team names and competition names where helpful. The page must load under 1 second on a mid-range mobile on 4G. It will be a PWA, installable on iOS and Android home screens. The most recently cached schedule must be viewable offline. No live scores, betting, or stream links. TV/OTT schedule only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看今日賽事直播 (Priority: P1)

A Hong Kong viewer opens the page to find out which football matches are on TV today and which channels to tune in to. They land directly on today's schedule, see all matches ordered by kick-off time in HKT, and can immediately identify the broadcaster/channel for each match.

**Why this priority**: This is the core value of the product — users come specifically to answer "what football is on TV today?" Getting this right with no friction is the foundation for everything else.

**Independent Test**: Load the page on a mobile device; today's schedule displays with match times (HKT), teams, competition, and broadcaster information. Delivers full value for the primary use case.

**Acceptance Scenarios**:

1. **Given** a user opens the page, **When** the page loads, **Then** they see a list of today's matches sorted by kick-off time in HKT
2. **Given** a match entry is displayed, **When** the user views it, **Then** they see: kick-off time in HKT, home team vs away team (Chinese primary, English secondary), competition name (Chinese primary, English secondary), and broadcaster/channel name(s)
3. **Given** a match has confirmed broadcast info, **When** displayed, **Then** the broadcaster name(s) are shown clearly without any warning indicator
4. **Given** a match has no broadcaster info available, **When** displayed, **Then** the match still appears with a graceful fallback label (e.g., 待定) instead of being hidden
5. **Given** a match kick-off time or details are unconfirmed or estimated, **When** displayed, **Then** a 待確認 badge or label is shown visibly on that match entry
6. **Given** there are no matches scheduled today, **When** the page loads, **Then** a clear empty-state message is shown in Traditional Chinese indicating no matches today

---

### User Story 2 - 按日期瀏覽賽程 (Priority: P2)

A viewer wants to plan their week and checks what matches are on tomorrow, or looks back at yesterday's schedule they missed. They use day-navigation controls to move forward or backward one day at a time.

**Why this priority**: The date browsing capability is the second most common action — users frequently check upcoming matches to plan viewing. Without this, the product is limited to only today's schedule.

**Independent Test**: Navigate one day forward and one day backward from today; correct matches for each date are shown. Fully testable without competition or team filters.

**Acceptance Scenarios**:

1. **Given** a user is viewing today's schedule, **When** they tap/click the forward-day control, **Then** tomorrow's schedule is shown and the date indicator updates
2. **Given** a user is viewing a future date, **When** they tap/click the backward-day control, **Then** the previous day's schedule is shown
3. **Given** a user is on mobile, **When** they use the date navigation, **Then** the controls are accessible without horizontal scrolling
4. **Given** a user opens the page, **When** no date is specified, **Then** today's date (HKT) is the default selected date

---

### User Story 3 - 按賽事或球隊篩選 (Priority: P3)

A viewer only cares about a specific competition (e.g., 英超) or a specific team (e.g., 利物浦). They use the competition or team filter to narrow the displayed matches to only those they care about, across the selected date.

**Why this priority**: Filters reduce noise for viewers with specific interests. Valuable but the product works without them — users can scroll through the unfiltered list.

**Independent Test**: Select a competition filter; only matches from that competition for the current date are shown. Testable independently of team filter.

**Acceptance Scenarios**:

1. **Given** multiple competitions are available on the selected date, **When** a user selects a competition filter, **Then** only matches from that competition are shown
2. **Given** matches from multiple teams, **When** a user selects a team filter, **Then** only matches involving that team are shown
3. **Given** both competition and team filters are active, **When** displayed, **Then** only matches matching both criteria are shown
4. **Given** a user is on a mobile device, **When** viewing the filters, **Then** all filter controls are visible and usable without horizontal scrolling
5. **Given** a filter is active that results in no matches, **When** displayed, **Then** a clear empty-state message is shown in Traditional Chinese

---

### User Story 4 - 離線查看賽程 (Priority: P4)

A viewer checks the schedule while commuting on the MTR with no data connection. The app was previously opened with a network connection. They can still see the last cached schedule and know they are viewing offline content.

**Why this priority**: Offline access is a key PWA differentiator and practically valuable in Hong Kong's underground transit. Lower priority as it requires prior online visit but meaningfully improves reliability.

**Independent Test**: Open the page online, then disable network and reload; the last viewed schedule is still visible with an offline indicator. Testable end-to-end without other features.

**Acceptance Scenarios**:

1. **Given** the user has previously loaded the schedule with a network connection, **When** they open the app with no network, **Then** the most recently cached schedule is displayed
2. **Given** the user is viewing cached offline content, **When** displayed, **Then** a clear indicator in Traditional Chinese shows that the content may be outdated and the user is offline
3. **Given** the user is offline and tries to navigate to a date not in the cache, **When** they navigate, **Then** an informative message in Traditional Chinese explains that browsing other dates requires a connection

---

### User Story 5 - 安裝為主畫面應用程式 (Priority: P5)

A regular viewer wants quick access without opening a browser every time. They install the schedule page as a PWA to their iOS or Android home screen, and can open it like a native app.

**Why this priority**: PWA installability improves retention and positions the product as a daily-driver tool. Lower priority as it is a distribution enhancement rather than core content delivery.

**Independent Test**: On iOS Safari and Android Chrome, the browser prompts for or the user can manually trigger home screen installation; the app launches full-screen from the home screen icon.

**Acceptance Scenarios**:

1. **Given** a user visits the page on an Android device in Chrome, **When** the browser criteria for PWA install are met, **Then** the browser shows an install prompt or the user can add to home screen
2. **Given** a user visits the page on an iOS device in Safari, **When** the user taps Share, **Then** "Add to Home Screen" is available and installs the app
3. **Given** the PWA is installed, **When** the user opens it from the home screen, **Then** it launches without browser chrome (full-screen or standalone mode)

---

### Edge Cases

- What happens when the selected date has no scheduled matches? → Show a clear empty-state message in Traditional Chinese; do not show a blank page
- What happens when a match has multiple broadcasters? → All broadcaster/channel names are displayed for that match entry
- What happens when a match entry has no broadcaster info at all? → Match is still shown with a graceful fallback label (e.g., 待定) rather than being hidden or showing an error
- What happens when a match time is estimated (e.g., subject to change)? → The match is shown with the 待確認 flag
- What happens when the user's device clock/timezone differs from HKT? → All times are displayed in HKT explicitly, regardless of device locale
- What happens when both competition and team filters yield no results? → Show empty state with option to clear filters
- What happens when the schedule data fails to load and no cache exists? → Show a user-friendly error in Traditional Chinese explaining the schedule is unavailable

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display a list of football matches for the selected date, ordered by kick-off time ascending
- **FR-002**: Each match entry MUST display: kick-off time in Hong Kong Time (HKT), home team name, away team name, competition/tournament name, and broadcaster/channel name(s)
- **FR-003**: Team names and competition names MUST be displayed in Traditional Chinese as the primary label, with English as a secondary label where available
- **FR-004**: Matches with unconfirmed or estimated kick-off times or details MUST display a 待確認 visual indicator
- **FR-005**: Matches with no broadcaster information MUST still appear in the listing with a graceful fallback label (e.g., 待定) rather than being hidden
- **FR-006**: The page MUST default to showing today's date (in HKT) when loaded without a specific date parameter
- **FR-007**: Users MUST be able to navigate forward and backward one day at a time to view other dates' schedules
- **FR-008**: Users MUST be able to filter the schedule by competition/tournament
- **FR-009**: Users MUST be able to filter the schedule by team
- **FR-010**: Multiple active filters MUST narrow results by AND logic (matches must satisfy all active filters simultaneously)
- **FR-011**: All filter controls MUST be fully usable on mobile screen widths without requiring horizontal scrolling
- **FR-012**: The entire interface MUST be in Traditional Chinese as the primary language
- **FR-013**: The page MUST achieve a full load time under 1 second on a mid-range mobile device on a 4G connection
- **FR-014**: The page MUST be a Progressive Web App (PWA) installable to the home screen on both iOS and Android
- **FR-015**: The most recently loaded schedule MUST remain viewable offline after the user has visited the page at least once with a network connection
- **FR-016**: When viewing offline cached content, a clear indicator MUST be shown informing the user the data may not be current
- **FR-017**: The page MUST NOT display live scores, betting odds, or links to streams

### Key Entities

- **Match**: Represents a single football fixture; attributes include kick-off date/time (HKT), home team, away team, competition, broadcaster(s), and a confirmation status (confirmed / unconfirmed / estimated)
- **Competition**: A football tournament or league (e.g., 英超, 歐冠); has a Traditional Chinese name and an optional English name; groups matches
- **Team**: A football club or national team; has a Traditional Chinese name and an optional English name; appears as home or away in matches
- **Broadcaster**: A TV channel or OTT platform broadcasting a match in Hong Kong; has a display name; a match may have multiple broadcasters

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The schedule page fully loads and is interactive in under 1 second on a mid-range mobile device on a 4G connection
- **SC-002**: Users can identify what football is on TV today within 5 seconds of opening the page, with no interaction required
- **SC-003**: All filter controls (date, competition, team) are accessible and operable on a 375px-wide mobile screen (iPhone SE) without horizontal scrolling
- **SC-004**: Matches with missing broadcaster data are never hidden — 100% of known matches appear in the listing regardless of data completeness
- **SC-005**: The PWA is successfully installable to the home screen on both iOS (Safari) and Android (Chrome)
- **SC-006**: A user who previously loaded the schedule can view the cached content offline with no network connection
- **SC-007**: All visible text on the page is in Traditional Chinese; no placeholder English-only labels appear for primary content fields

## Assumptions

- **Schedule date range**: Matches are browsable from today (HKT) up to 7 days in advance. Past dates are not navigable. The range can be extended if broadcasters begin confirming schedules further ahead.
- **Data management**: Schedule data is managed externally (e.g., by an admin or data pipeline). This spec covers only the public-facing read-only view.
- **Filter scope**: Filters apply only within the selected date — competition and team filters do not span multiple dates simultaneously.
- **HKT display**: All times are displayed as HKT (UTC+8) explicitly, regardless of the viewer's device timezone.
- **Offline scope**: Offline access shows the last successfully cached day's schedule. Navigation to other dates while offline is not required to work.
- **No user accounts**: The page is fully public with no login, personalisation, or user accounts required.
- **English labels**: English secondary labels on team/competition names are shown only when an English name exists in the data; no translation is required if absent.
