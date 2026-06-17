# Feature Specification: Roadmap Content Management Application

**Feature Branch**: `001-roadmap-content-mgmt`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "create a roadmap content management web application that use the https://ihtsdo.github.io/snomed-international-resources/dashboards/content-roadmap.html as the template for development"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Roadmap Dashboard (Priority: P1)

A content viewer opens the application and sees the full SNOMED CT Content Development Roadmap organized into horizons (Now, Next, Later, Under Assessment, In Maintenance). Each work item is displayed as a card with status, impact, title, and key fields. The user can read the current state of all roadmap items at a glance.

**Why this priority**: Core read functionality. Without this, no other feature has value. Delivers immediate value as a published, browsable roadmap.

**Independent Test**: Load the application with populated data — all roadmap items appear grouped by horizon with correct status badges, impact indicators, and content fields visible.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** a user views the dashboard, **Then** work items are grouped under Now / Next / Later / Under Assessment / In Maintenance horizons with item counts per horizon visible
2. **Given** a work item exists, **When** the user views its card, **Then** the card shows: SI status badge, impact rating, topic title, ask description, activity type, timeline classification, trigger, and provenance chips
3. **Given** the dashboard is displayed, **When** no items match a horizon, **Then** that horizon is either hidden or clearly shown as empty

---

### User Story 2 - Filter Roadmap Items (Priority: P2)

A user wants to focus on specific roadmap items. They use filter controls to narrow results by origin event (Seoul '24, Antwerp '25, Vienna '26), SI status (Active, Planned, No activity), or activity type (Member-Driven, Collaboration, CRG, Authoring, etc.). The dashboard updates immediately to show only matching items.

**Why this priority**: The reference template's primary interaction feature. Essential for large roadmaps where browsing all items is impractical.

**Independent Test**: Apply a single filter — only matching items appear; item counts per horizon update; a reset control returns to the full view.

**Acceptance Scenarios**:

1. **Given** the full roadmap is displayed, **When** the user selects an origin filter (e.g., "Seoul '24"), **Then** only items tagged with that origin are shown
2. **Given** filters are active, **When** the user clicks Reset, **Then** all items are restored and all filters return to their default state
3. **Given** multiple filters are applied, **When** the user views results, **Then** only items matching ALL active filter selections are shown

---

### User Story 3 - Manage Roadmap Items (Priority: P1)

A content administrator creates, edits, and deletes roadmap work items. They fill in all card fields: title, ask description, SI status, impact rating, activity type, timeline classification, trigger, provenance chips, progress narrative, next milestones, and whether the request is sufficiently addressed. Changes are saved and immediately reflected in the dashboard view.

**Why this priority**: Core authoring capability — without it, the application is read-only and cannot serve as a management tool.

**Independent Test**: Create a new roadmap item with all required fields → item appears in the correct horizon on the dashboard. Edit it → changes reflected immediately. Delete it → item removed from view.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator, **When** they create a new item with all required fields, **Then** the item appears in the correct horizon group based on its assigned horizon
2. **Given** an existing item, **When** an administrator edits any field and saves, **Then** the dashboard immediately reflects the updated values
3. **Given** an existing item, **When** an administrator deletes it, **Then** the item is removed from the dashboard and cannot be recovered without explicit undo/restore
4. **Given** a new item form, **When** required fields are left blank and submitted, **Then** validation errors are shown per field and the item is not saved

---

### User Story 4 - View Timeline Visualization (Priority: P2)

A user views a Gantt-style horizontal timeline showing each work item's expected active window across delivery periods (H1 2026 through 2029+). Active work shows solid bars; planned/uncommitted work shows dashed bars; items under assessment show grey bars.

**Why this priority**: Critical for communicating delivery timing to stakeholders. Mirrors the reference template's timeline section.

**Independent Test**: Load timeline view — each item with defined delivery periods renders a bar spanning those periods; bar style reflects commitment status.

**Acceptance Scenarios**:

1. **Given** items with defined delivery periods, **When** the timeline view is displayed, **Then** each item shows a horizontal bar spanning its start and end periods
2. **Given** a planned (uncommitted) item, **When** displayed on the timeline, **Then** its bar uses a distinct visual style (e.g., dashed/amber) to indicate uncommitted status
3. **Given** items under assessment, **When** displayed on the timeline, **Then** their bars use the assessment visual style (grey)

---

### User Story 5 - View Top Member Priorities (Priority: P3)

A user views the Top 5 Member Priorities section, which displays a ranked list of member-requested focus areas. Each entry shows its survey rank, response count, percentage, associated conference signals, current SI activity, progress summary, next milestones, and risk factors.

**Why this priority**: Important stakeholder communication feature, but lower priority than core item management and viewing.

**Independent Test**: Navigate to the Member Priorities section — five ranked items display with all associated data fields populated.

**Acceptance Scenarios**:

1. **Given** member priority data exists, **When** a user views this section, **Then** items are displayed in rank order (1–5) with all associated fields
2. **Given** a priority item, **When** the user expands it, **Then** full details including risk factors and next milestones are visible

---

### User Story 6 - Manage Evidence & Input Data (Priority: P3)

A content administrator adds and updates evidence inputs: survey results (member count, gap areas ranked), workshop themes (event name, date, participant count, themes), and cross-event priority shift data. This data populates the Evidence tab of the published roadmap.

**Why this priority**: Supporting data for the roadmap, important for credibility but not blocking core functionality.

**Independent Test**: Add a new evidence input for a workshop → it appears in the Evidence section on the dashboard with correct fields.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator, **When** they add evidence from a named event, **Then** it appears in the Evidence section tagged with that event
2. **Given** existing evidence, **When** an administrator edits it, **Then** the updated data is shown on the dashboard

---

### Edge Cases

- What happens when a roadmap item has no delivery periods defined (timeline view)?
- How does the system handle items that transition between horizons (e.g., Now → In Maintenance)?
- What happens when an administrator saves an item with conflicting horizon and status values (e.g., "Later" horizon with "Active" status)?
- How are concurrent edits handled if two administrators edit the same item simultaneously?
- What happens when all items are filtered out — does the dashboard show an empty state message?
- How does the timeline render for items with open-ended end dates (ongoing work)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display roadmap work items grouped into five horizons: Now, Next, Later, Under Assessment, and In Maintenance
- **FR-002**: System MUST display each work item with: SI status badge, impact rating (High/Medium/Low), topic title, ask description, activity type, timeline classification (Project/Continuous), trigger, provenance chips, progress narrative, and milestone dates
- **FR-003**: System MUST support filtering items by origin event, SI status, and activity type simultaneously
- **FR-004**: System MUST provide a Reset control that clears all active filters and restores the full item list
- **FR-005**: Authenticated administrators MUST be able to create new roadmap work items with all defined fields
- **FR-006**: Authenticated administrators MUST be able to edit any field of an existing roadmap work item
- **FR-007**: Authenticated administrators MUST be able to delete roadmap work items
- **FR-008**: System MUST validate required fields on item creation and editing, blocking save when required fields are absent
- **FR-009**: System MUST display a Gantt-style horizontal timeline showing each item's delivery window across defined periods (H1 2026–2029+)
- **FR-010**: System MUST visually distinguish timeline bar styles: solid for active/committed, dashed/amber for planned/uncommitted, grey for under assessment
- **FR-011**: System MUST display a Top 5 Member Priorities section with rank, response data, current SI activity, progress, milestones, and risks
- **FR-012**: Authenticated administrators MUST be able to manage evidence inputs (survey results, workshop data, cross-event priority shifts)
- **FR-013**: System MUST support color-coded activity type indicators matching the six defined activity types in the reference template
- **FR-014**: System MUST display item counts per horizon group
- **FR-015**: System MUST restrict item creation, editing, and deletion to authenticated administrators; unauthenticated users have read-only access
- **FR-016**: System MUST display a Glossary & Key section explaining horizons, activity types, status badges, triggers, and provenance chips

### Key Entities

- **Roadmap Item**: Core work item with fields — title, ask description, SI status (Active/Planned/Paused/Deferred), impact (High/Medium/Low), horizon (Now/Next/Later/Under Assessment/In Maintenance), activity type, timeline classification, trigger, provenance chips, progress narrative, addressed status (Yes/Partially/No), next milestone date, implementation notes/risks, delivery periods (start–end for timeline)
- **Provenance Event**: Reference to an input event (e.g., Seoul '24, Antwerp '25, Vienna '26) with date and type; linked to roadmap items as chips
- **Member Priority**: Ranked priority entry with survey rank, response count, response percentage, linked provenance events, current SI activity description, progress summary, milestones, risks
- **Evidence Input**: Record of a member input event with type (survey/workshop/forum), event name, date, participant count, and structured findings (themes, ranked gaps, cross-priority shifts)
- **Administrator**: User with write access to create, edit, and delete all content entities

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Content administrators can create or update a roadmap item with all fields in under 3 minutes
- **SC-002**: All roadmap items load and display on the dashboard in under 3 seconds on a standard connection
- **SC-003**: Applying or clearing a filter updates the visible item list in under 1 second
- **SC-004**: 90% of first-time users can locate a specific roadmap item using filters without external guidance
- **SC-005**: The timeline visualization correctly represents delivery periods for 100% of items that have defined periods
- **SC-006**: Unauthenticated users cannot access any create, edit, or delete functionality (0% unauthorized write operations succeed)
- **SC-007**: Content administrators report that the authoring interface reduces time spent preparing roadmap updates compared to manual editing by at least 50%

## Assumptions

- Users are primarily SNOMED International staff and member organization representatives; the administrator role is limited to SNOMED International internal content teams
- The application is web-based and accessible via modern desktop browsers; mobile optimization is not required for v1
- Authentication uses the organization's existing identity provider (standard OAuth2/SSO); a separate user management system is not in scope
- The six activity types and five horizon categories from the reference template are fixed for v1; reconfiguring category definitions is out of scope
- Delivery periods for the timeline are defined as half-year periods (H1/H2 YYYY) matching the reference template's structure
- The roadmap is publicly viewable without authentication; only write operations require login
- A single instance of the application serves all users; multi-tenancy is out of scope
- Bulk import/export of roadmap data (e.g., CSV, spreadsheet) is out of scope for v1
