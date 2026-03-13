# Feature Specification: 賽程管理後台

**Feature Branch**: `002-schedule-admin`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "An admin interface for the sole operator to create, edit, and delete football match schedule entries. The operator is both developer and editor, entering data manually 1-2 times per week based on publicly available schedule information. Each match record must capture: home team, away team, competition, kick-off time (entered in HKT, stored as UTC), broadcaster(s)/channel(s), source_type (manual by default), confidence level (confirmed/unconfirmed/estimated), and last_updated timestamp. The form must be optimised for fast entry: pre-populated dropdowns for competitions, teams, channels, and broadcasters (no free-text where a known value exists); keyboard-navigable (tab between fields, submit without mouse); a copy-forward option for recurring fixtures (same time, same channel as a previous week's entry); and a way to create multiple matches in one session without reloading. The admin must also be able to flag a record as unconfirmed, edit a published record, and trigger a cache invalidation so corrections appear on the public site immediately. No public access. Single operator, no user management required in v1."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 建立新賽事記錄 (Priority: P1)

The operator sits down on a weekday evening, opens the admin, and enters a batch of newly announced fixtures for the coming week. They want to get through 5–10 entries quickly using only the keyboard, selecting from dropdowns for all known values.

**Why this priority**: Creating records is the core function of the admin. Without it, nothing else works. A single completed entry proves end-to-end value.

**Independent Test**: Open the admin and create one match record with all fields populated; verify it appears in the public schedule. Fully testable without edit, delete, or copy-forward.

**Acceptance Scenarios**:

1. **Given** the operator opens the new-match form, **When** they tab through fields, **Then** focus moves in a logical order (date → time → home team → away team → competition → broadcaster(s) → confidence) without requiring mouse use
2. **Given** the operator is on the competition field, **When** they type a partial name, **Then** a dropdown of known competitions filters to matching options
3. **Given** the operator selects teams, competition, and broadcaster(s) from dropdowns, **When** they submit the form, **Then** no free-text is required and the record is saved with all selected values
4. **Given** the operator enters a kick-off time in HKT, **When** the record is saved, **Then** the stored value is correctly converted to UTC
5. **Given** the operator submits a valid record, **When** saved, **Then** the form clears (or resets) and is immediately ready for the next entry without a full page reload
6. **Given** the operator submits an incomplete record (missing required fields), **When** saved, **Then** inline validation identifies the missing fields and the record is not saved

---

### User Story 2 - 批量錄入同一場次 (Priority: P2)

A recurring fixture (e.g., Premier League Saturday 3pm, same broadcaster) needs to be entered weekly. The operator uses the copy-forward feature to duplicate last week's entry and only adjusts the date and teams.

**Why this priority**: The operator enters data 1–2 times per week with many recurring patterns. Copy-forward eliminates repetitive re-entry and reduces input errors on stable fields.

**Independent Test**: Find a previous match entry and copy it forward; verify that the new record pre-fills the correct fields and can be saved with minimal edits.

**Acceptance Scenarios**:

1. **Given** the operator is viewing the match list or a specific entry, **When** they trigger copy-forward on a record, **Then** a new entry form opens pre-filled with the same kick-off time, broadcaster(s), and competition as the source record
2. **Given** the pre-filled form is shown, **When** the operator changes only the date and teams, **Then** the new record saves correctly without requiring all other fields to be re-entered
3. **Given** copy-forward is triggered, **When** the new form opens, **Then** the date defaults to exactly 7 days after the source record's date (one week later)

---

### User Story 3 - 編輯已發佈記錄及更新緩存 (Priority: P3)

A broadcaster change is announced after the schedule has already been published. The operator finds the affected match, edits the broadcaster field, saves, and immediately triggers a cache invalidation so the correction appears on the public site.

**Why this priority**: Corrections are time-sensitive — incorrect broadcaster info is actively misleading viewers. The ability to edit and instantly push corrections is a key operational requirement.

**Independent Test**: Edit an existing match record's broadcaster field, save, trigger cache invalidation, then verify the public schedule reflects the change. Testable independently of create and copy-forward.

**Acceptance Scenarios**:

1. **Given** the operator opens an existing match record, **When** they change any field and save, **Then** the record is updated and the last_updated timestamp refreshes automatically
2. **Given** the operator has saved an edit, **When** they trigger cache invalidation, **Then** the public schedule is updated to reflect the corrected data within 30 seconds
3. **Given** the operator triggers cache invalidation, **When** the process completes, **Then** a confirmation message indicates the cache was cleared successfully
4. **Given** the operator edits a record and marks confidence as "unconfirmed", **When** saved, **Then** the public schedule shows the 待確認 flag for that match

---

### User Story 4 - 刪除賽事記錄 (Priority: P4)

A match is cancelled or was entered in error. The operator finds the record and deletes it so it no longer appears on the public schedule.

**Why this priority**: Data hygiene is important but lower priority than create/edit — a cancelled match showing is less harmful than missing a broadcaster correction.

**Independent Test**: Delete an existing match record; verify it no longer appears on the public schedule.

**Acceptance Scenarios**:

1. **Given** the operator selects a match record for deletion, **When** they confirm the delete action, **Then** the record is permanently removed
2. **Given** the operator initiates a delete, **When** a confirmation prompt appears, **Then** they must explicitly confirm before the record is deleted (no accidental deletion)
3. **Given** a record is deleted, **When** the operator triggers cache invalidation, **Then** the deleted entry is removed from the public schedule within 30 seconds

---

### User Story 5 - 管理參考資料（賽事、球隊、轉播商） (Priority: P5)

A new competition or broadcaster not yet in the system needs to be added before match entries using it can be created. The operator adds the new item to the reference list so it appears in future dropdowns.

**Why this priority**: Maintaining the reference lists is an occasional but necessary maintenance task. Without it, new competitions/teams/broadcasters would require free-text entry, undermining data consistency.

**Independent Test**: Add a new broadcaster to the reference list; verify it appears in the broadcaster dropdown when creating a new match entry.

**Acceptance Scenarios**:

1. **Given** the operator opens the reference data management area, **When** they add a new competition, team, or broadcaster, **Then** it immediately appears as an option in the relevant dropdowns on the match entry form
2. **Given** the operator tries to add a duplicate name, **When** submitted, **Then** the system rejects it with a clear error message

---

### Edge Cases

- What if the operator submits a record with the same teams and kick-off time as an existing entry on the same date? → Show a duplicate-warning confirmation; allow saving with explicit acknowledgement
- What if cache invalidation fails? → Show a clear error message; the record remains saved and the operator can retry invalidation separately
- What if the operator closes the tab mid-entry? → Unsaved data is lost; no auto-draft save is required in v1
- What if a reference item (e.g., a team) is referenced by existing match records and the operator tries to delete it? → Warn that existing records reference this item; block deletion until records are updated
- What if the broadcaster field is left empty? → The record can be saved with no broadcaster selected; the public site will display the graceful fallback label as defined in spec 001
- What if the operator enters a past date? → The form allows it; past-date entries are valid for historical schedule data

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin MUST allow the operator to create a new match record capturing: home team, away team, competition, kick-off date and time (entered in HKT), broadcaster(s)/channel(s), source_type, confidence level, and last_updated timestamp
- **FR-002**: Kick-off time MUST be entered by the operator in HKT and stored internally as UTC
- **FR-003**: The source_type field MUST default to "manual" for all new records created through the admin
- **FR-004**: The last_updated timestamp MUST be automatically set to the current date/time on every create or edit operation
- **FR-005**: All fields where a known reference value exists (team, competition, broadcaster/channel) MUST use pre-populated dropdowns; free-text entry is NOT permitted for these fields in the match entry form
- **FR-006**: The match entry form MUST be fully operable via keyboard only: tab navigation between all fields, and form submission without requiring mouse use
- **FR-007**: After a new match record is saved, the form MUST reset and be ready for the next entry without a full page reload
- **FR-008**: The admin MUST provide a copy-forward action on existing records that opens a new entry form pre-filled with the kick-off time, broadcaster(s), and competition of the source record, with the date defaulting to 7 days after the source record's date
- **FR-009**: The admin MUST allow the operator to edit any field of an existing match record
- **FR-010**: The admin MUST allow the operator to delete a match record, with an explicit confirmation step before the record is permanently removed
- **FR-011**: The admin MUST provide a cache invalidation action that causes the public schedule to reflect the latest data within 30 seconds of being triggered
- **FR-012**: The confidence level field MUST offer exactly three options: confirmed, unconfirmed, estimated
- **FR-013**: The admin MUST be inaccessible to unauthenticated or public requests
- **FR-014**: No user account management, role management, or multi-user support is required in v1
- **FR-015**: The admin MUST allow the operator to add new entries to reference lists (competitions, teams, broadcasters/channels) independently of match entry

### Key Entities

- **Match Record**: The primary data object; attributes include home team, away team, competition, kick-off time (stored as UTC), source_type, confidence level (confirmed/unconfirmed/estimated), broadcaster(s), and last_updated timestamp
- **Competition**: Reference entity used in match records; has a display name; managed in a reference list
- **Team**: Reference entity used as home or away in a match record; has a display name; managed in a reference list
- **Broadcaster / Channel**: Reference entity used in match records; a single match may list multiple broadcasters; managed in a reference list

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The operator can complete a new match entry using keyboard only (no mouse) in under 60 seconds per record
- **SC-002**: After triggering cache invalidation, the corrected data is visible on the public schedule within 30 seconds
- **SC-003**: 100% of team, competition, and broadcaster fields use pre-populated selections — zero free-text entry is required for known reference values
- **SC-004**: The copy-forward feature reduces repeat data entry to at most 2 field changes for a weekly recurring fixture (date and teams)
- **SC-005**: Multiple match records can be created in a single session without the page reloading between entries
- **SC-006**: The admin is inaccessible to unauthenticated requests; 100% of public access attempts are blocked

## Assumptions

- **Single operator**: The admin is designed for exactly one user in v1. No concurrent editing, conflict resolution, or multi-user audit trail is required.
- **Authentication**: Access is protected by a simple single-credential mechanism (e.g., a password or network-level access control). Full OAuth2 or SSO is not required in v1.
- **Reference data seed**: The initial competitions, teams, and broadcasters are seeded manually at setup. The admin provides a UI to add new entries but no bulk-import tool is required in v1.
- **Cache invalidation scope**: Invalidation clears the entire public schedule cache, not individual records. Granular per-record invalidation is not required in v1.
- **No soft delete**: Deleted records are permanently removed. No trash bin or record-recovery mechanism is required in v1.
- **No draft/autosave**: Unsaved form data is lost if the tab is closed. Autosave is out of scope for v1.
- **Desktop-first**: The admin UI is optimised for desktop use (keyboard navigation focus). A mobile-optimised admin is not required in v1.
- **Admin language**: The admin interface may use English as its primary language, since the sole operator is the developer. Traditional Chinese is not required in the admin UI.
