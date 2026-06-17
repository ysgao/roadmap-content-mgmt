# Feature Specification: Jira Ticket Linking

**Feature Branch**: `003-jira-ticket-linking`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "new feature to include JIRA tickets based on the roadmap origins, status, activities by linking them directly through MCP service for details of JRA content."

## User Scenarios & Testing *(mandatory)*

### User Story 0 — Optionally Sign In to View Jira Tickets (Priority: P1)

Any visitor can view the roadmap dashboard without logging in — matching the public commitment of the reference template. When a visitor expands a roadmap card that has linked Jira tickets, they see a "Sign in with SNOMED account to view Jira details" prompt. A SNOMED International staff member clicks this, authenticates via Keycloak, and is returned to the same card where Jira ticket details now appear. Visitors without a SNOMED account continue to use the full public dashboard with no restrictions except the Jira panel.

**Why this priority**: Preserves the public transparency commitment ("publicly accessible version for non-members") while giving SNOMED staff richer operational detail via Jira.

**Independent Test**: Open dashboard without login → full roadmap visible. Expand a card with linked tickets → Jira panel shows "Sign in to view Jira details". Click sign-in → Keycloak login → return to dashboard → same card now shows live ticket data.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor opens the dashboard, **When** the page loads, **Then** the full roadmap (all horizons, cards, filters, timeline) is visible without any login requirement
2. **Given** a card has linked Jira tickets and the user is not signed in, **When** the user expands the card, **Then** the Jira panel shows a "Sign in to view Jira details" prompt instead of ticket data
3. **Given** a user clicks "Sign in", **When** they authenticate successfully via Keycloak, **Then** they are returned to the dashboard and Jira ticket details are displayed on linked cards
4. **Given** a signed-in user's session expires, **When** they expand a card with Jira tickets, **Then** the Jira panel shows "Sign in to view Jira details" again
5. **Given** a visitor without a SNOMED Keycloak account, **When** they use the dashboard, **Then** they can access all roadmap content but never see Jira ticket details

---

### User Story 1 — View Linked Jira Tickets on a Roadmap Card (Priority: P1)

A roadmap viewer expands a roadmap item card (e.g., "Surgical Procedures") and sees a list of linked Jira tickets. Each ticket shows its key (e.g., CRS-1234), summary, current status, assignee, and a direct link to open the ticket in Jira. The live ticket data is fetched in real time so the viewer always sees the current state without any manual update to the spreadsheet.

**Why this priority**: Core value of the feature — connecting planning-level roadmap items to the execution-level Jira work items, giving stakeholders a single view of intent and delivery.

**Independent Test**: Expand a roadmap card that has linked ticket IDs → Jira ticket panel appears below the card details with correct ticket key, summary, status, and link. Ticket status reflects the current live state in Jira.

**Acceptance Scenarios**:

1. **Given** a roadmap item has one or more Jira ticket IDs linked, **When** a user expands the card, **Then** a linked tickets section appears showing each ticket's key, summary, status, assignee, and a clickable link to Jira
2. **Given** Jira ticket details are displayed, **When** the ticket status has changed in Jira since last load, **Then** the current status is shown (not a cached/stale state)
3. **Given** a roadmap item has no linked Jira tickets, **When** a user expands the card, **Then** no linked tickets section is shown (section is hidden, not shown as empty)
4. **Given** a Jira ticket ID is invalid or the ticket is inaccessible, **When** the card is expanded, **Then** a graceful message is shown (e.g., "Ticket not accessible") without breaking the card display

---

### User Story 2 — Link Jira Tickets to a Roadmap Item via Google Sheet (Priority: P1)

A content administrator adds one or more Jira ticket IDs to a roadmap item by editing the `jiraTickets` column in the RoadmapItems Google Sheet. Multiple tickets are entered as a pipe-separated list (e.g., `CRS-1234|CRS-5678`). On the next dashboard load, the linked tickets appear on the corresponding roadmap card.

**Why this priority**: The Google Sheet is the existing content management interface for this application. Keeping ticket linking in the sheet avoids building a separate admin UI for this feature.

**Independent Test**: Add a Jira ticket ID to the `jiraTickets` column for a roadmap item in the sheet → reload the dashboard → the ticket appears on that item's card with live data fetched from Jira.

**Acceptance Scenarios**:

1. **Given** the `jiraTickets` column contains `CRS-1234|CRS-5678`, **When** the dashboard loads, **Then** both tickets appear as linked on that roadmap card
2. **Given** the `jiraTickets` column is empty or blank, **When** the dashboard loads, **Then** no linked tickets section appears on that card
3. **Given** a content administrator removes a ticket ID from the sheet, **When** the dashboard next loads, **Then** that ticket no longer appears on the card

---

### User Story 3 — Filter Roadmap Items by Jira Activity (Priority: P2)

A user wants to see which roadmap items have active Jira work in progress. They use a filter to show only items that have at least one linked Jira ticket with an "In Progress" or "Open" status. The dashboard updates to show only those items across all horizons.

**Why this priority**: Enables programme managers to quickly identify items with active Jira execution, bridging the gap between the strategic roadmap view and operational delivery tracking.

**Independent Test**: Apply "Has active Jira tickets" filter → only cards with at least one In Progress or Open ticket remain visible; items with no tickets or only Closed/Done tickets are hidden.

**Acceptance Scenarios**:

1. **Given** the filter "Has active Jira work" is applied, **When** the dashboard displays, **Then** only roadmap items with at least one linked ticket in an open/in-progress state are shown
2. **Given** the filter is cleared, **When** the dashboard displays, **Then** all roadmap items are visible regardless of Jira ticket status

---

### Edge Cases

- What happens when Jira is unavailable or times out — does the roadmap card still display without the ticket section?
- What if the same Jira ticket is linked to multiple roadmap items — is it shown on all of them?
- What if a ticket ID in the sheet is malformed (e.g., `CRS` without a number) — is it silently ignored or shown as an error?
- What happens for public visitors if Jira requires authentication to view the ticket — do they see the summary only, or a "login required" message?
- How many tickets can be linked to a single roadmap item before the card becomes unwieldy?

## Requirements *(mandatory)*

### Functional Requirements

**Optional Authentication (Jira section only)**

- **FR-001**: The roadmap dashboard, timeline, and all public content MUST be accessible to any visitor without authentication
- **FR-002**: The Jira ticket panel MUST require authentication — unauthenticated users MUST see a "Sign in to view Jira details" prompt instead of ticket data
- **FR-003**: Clicking "Sign in" MUST redirect the user to the SNOMED International Keycloak login page and return them to the dashboard after successful authentication
- **FR-004**: Sessions MUST expire after a configurable idle period (default: 8 hours); expired sessions MUST show the "Sign in" prompt again on Jira panels

**Jira Ticket Linking**

- **FR-005**: The Google Sheet RoadmapItems tab MUST include a `jiraTickets` column supporting pipe-separated Jira ticket keys (e.g., `CRS-1234|CRS-5678`)
- **FR-006**: When an authenticated user expands a roadmap card with linked tickets, the application MUST fetch and display live ticket details for each linked ticket key
- **FR-007**: Each displayed ticket MUST show at minimum: ticket key, summary, current status, assignee name, and a direct URL link to the ticket in Jira
- **FR-008**: The linked tickets section MUST only appear on cards that have at least one linked ticket; unauthenticated cards with tickets show the sign-in prompt; cards with no tickets show nothing
- **FR-009**: If a Jira ticket cannot be fetched (invalid key, access error, timeout), the application MUST display a graceful fallback message for that ticket without breaking the rest of the card
- **FR-010**: Ticket data MUST be fetched live on card expansion, not pre-fetched at page load
- **FR-011**: The dashboard MUST support filtering to show only roadmap items that have at least one linked Jira ticket in an active state (Open, In Progress, or equivalent non-Done status); the filter requires authentication — unauthenticated users who enable it MUST be prompted to sign in; Jira ticket statuses are mapped to active/inactive to determine visibility
- **FR-012**: A content administrator MUST be able to link tickets to a roadmap item by editing the `jiraTickets` column in the Google Sheet only
- **FR-013**: Clicking a ticket key or link MUST open the Jira ticket in a new browser tab
- **FR-014**: The linked tickets section MUST display correctly on all roadmap cards regardless of horizon

### Key Entities

- **JiraTicketLink**: A reference from a roadmap item to a Jira ticket — stored as a pipe-delimited string of ticket keys in the Google Sheet `jiraTickets` column
- **JiraTicket**: Live data fetched from Jira — fields: key (e.g., CRS-1234), summary, status, assignee, URL
- **RoadmapItem** (extended): Existing entity with new `jiraTickets` field added to the Google Sheet schema

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of roadmap content (cards, filters, timeline) is accessible to unauthenticated visitors — no part of the public dashboard is blocked
- **SC-002**: A SNOMED staff member can sign in and see Jira ticket details within 15 seconds (including Keycloak redirect round-trip and ticket fetch)
- **SC-003**: Live Jira ticket details appear on a linked card within 2 seconds of card expansion by an authenticated user
- **SC-004**: 100% of roadmap items with tickets in the Google Sheet show the sign-in prompt (unauthenticated) or live ticket data (authenticated)
- **SC-005**: A content administrator can link a new Jira ticket to a roadmap item in under 1 minute by editing the Google Sheet, with no application changes required
- **SC-006**: When Jira is unavailable, 100% of roadmap cards still load and display normally — Jira unavailability does not affect the public dashboard
- **SC-007**: Filtering by "Has active Jira tickets" shows only roadmap items with at least one ticket in an Open or In Progress state, with zero false positives and zero false negatives relative to live Jira ticket statuses

## Assumptions

- The roadmap dashboard is publicly accessible to all visitors — matching the reference template's public commitment ("publicly accessible version for non-members") made at Vienna '26
- Authentication via Keycloak is optional and scoped exclusively to the Jira ticket panel; all other application functionality remains public
- Authentication uses SNOMED International's existing Keycloak identity provider (OIDC/OAuth2); no separate user management is required
- The Jira instance is SNOMED International's Atlassian Jira (same instance as the CRS — Content Request Service)
- Jira ticket keys follow the format `PROJECT-NUMBER` (e.g., `CRS-1234`, `SCTMD-5678`)
- The `jiraTickets` column is a new column added to the existing RoadmapItems Google Sheet tab; it does not replace any existing columns
- A roadmap item may have zero, one, or many linked Jira tickets; there is no enforced maximum for v1
- Ticket data is fetched on demand (when a card is expanded) rather than eagerly at page load, to avoid rate-limiting and slow page loads
- The Jira integration is read-only — the application displays ticket data but does not create, modify, or transition Jira tickets
- If a Jira ticket is linked but cannot be fetched, the application shows the ticket key and a "not accessible" message rather than hiding the link entirely
- The GitHub Pages frontend deployment is retained for the public dashboard; a separate backend service is required only for the Jira proxy endpoint and Keycloak auth callbacks
- The backend is a minimal service (Jira proxy + auth) deployed to Render; it is not needed for any public roadmap functionality
