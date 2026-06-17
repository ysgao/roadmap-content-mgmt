# Feature Specification: Import Template Roadmap Content

**Feature Branch**: `002-import-template-content`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Include all content from the template for road map into this new content roadmap."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Complete Roadmap with Real Content (Priority: P1)

A visitor opens the roadmap dashboard and sees all 31 real SNOMED CT content development work items from the reference template, correctly grouped under their horizons (Now, Next, Later, Under Assessment, In Maintenance), with accurate status badges, impact ratings, provenance chips, delivery timeline bars, progress narratives, and milestone dates — matching the published reference template.

**Why this priority**: Without real content, the application has no value. This is the entire purpose of the import.

**Independent Test**: Open the dashboard → count items per horizon: 12 Now, 3 Next, 1 Later, 9 Under Assessment, 6 In Maintenance = 31 total. Verify each item shows the correct status, activity type, and provenance chips from the reference template.

**Acceptance Scenarios**:

1. **Given** all template content is loaded into the Google Sheet, **When** a user opens the dashboard, **Then** 31 roadmap items are visible grouped into 5 horizons matching the reference template
2. **Given** a specific item such as "Surgical Procedures", **When** the user expands its card, **Then** the card shows: status=Active, horizon=Now, activityType=QAProgramme, provenance chips Seoul '24 #5 and Antwerp '25, delivery periods H1 2026 and H2 2026, progress narrative, and addressed status
3. **Given** the dashboard is loaded, **When** the user views horizon counts, **Then** counts match: Now=12, Next=3, Later=1, UnderAssessment=9, InMaintenance=6

---

### User Story 2 — View Real Member Priorities (Priority: P1)

A visitor views the Top 5 Member Priorities section and sees the actual priority data from the Seoul 2024 survey: Laboratory Observations (rank 1, 13/23 responses, 57%), Substances (rank 2, 12/23, 52%), Imaging (rank 3, 11/23, 48%), Drug Extension Model (rank 4, 10/23, 43%), Surgical Procedures (rank 5, 9/23, 39%) — with current SI activity, progress summaries, next milestones, and risk factors.

**Why this priority**: Member priorities are the primary driver of the roadmap. Stakeholders specifically look at this section to understand what SNOMED International is prioritising.

**Independent Test**: Scroll to Member Priorities section → verify 5 entries in rank order with correct titles, response counts, percentages, and linked provenance events.

**Acceptance Scenarios**:

1. **Given** member priority data is loaded, **When** a user views the priorities section, **Then** 5 priorities appear in rank order matching the Seoul 2024 survey results
2. **Given** priority rank 1, **When** the user expands it, **Then** it shows: topicTitle="Laboratory (Observations)", responseCount=13, responsePercentage=57%, provenance Seoul '24

---

### User Story 3 — View Evidence Inputs from 3 Events (Priority: P2)

A visitor viewing the evidence section sees structured data for all 3 input events: Seoul Member Forum (October 2024, n=23, 19 ranked gaps), Antwerp Workshop (October 2025, 16 countries, 5 cross-cutting themes + 13 poster groups), and Vienna Member Forum (April 2026, 9 NRC groups, 6 macro-patterns).

**Why this priority**: Evidence supports the credibility of the roadmap prioritisation. Important for transparency with members and stakeholders.

**Independent Test**: Open evidence section → 3 entries present with correct event names, dates, participant counts, and summary content.

**Acceptance Scenarios**:

1. **Given** evidence data is loaded, **When** a user views the evidence section, **Then** 3 entries appear for Seoul 2024, Antwerp 2025, and Vienna 2026 with correct metadata
2. **Given** Seoul 2024 evidence, **When** expanded, **Then** shows 19 ranked gap areas with member response counts

---

### User Story 4 — Filter Returns Real Content (Priority: P2)

A user applies filters against the real content. Filtering by origin "Seoul '24" returns items linked to the Seoul survey. Filtering by activity type "Collaboration" returns Cancer, Rare Diseases, ICD-11 Alignment, Genomics, Social Determinants of Health, and MedDRA. Filtering by SI status "Paused" returns Allergies and Microbiology.

**Why this priority**: Filters only provide value when applied to real, correctly tagged content.

**Independent Test**: Select filter "Seoul '24" → verify items tagged with Seoul24 provenance chip are shown; select "Paused" status filter → exactly Allergies and Microbiology appear.

**Acceptance Scenarios**:

1. **Given** real content is loaded, **When** user filters by origin "Seoul '24", **Then** all items with Seoul24 provenance chip appear and items without do not
2. **Given** real content is loaded, **When** user filters by siStatus "Paused", **Then** exactly Allergies and Microbiology appear
3. **Given** real content is loaded, **When** user filters by activityType "Collaboration", **Then** Cancer, Rare Diseases, ICD-11 Alignment, Genomics, Social Determinants of Health, and MedDRA appear

---

### Edge Cases

- What happens when a roadmap item has no delivery periods (Under Assessment items)?
- What happens when a provenance chip has a reference number vs no reference number?
- What happens when impactRating is blank (In Maintenance items like Member Content Requests)?
- How are "2029+" periods handled in the timeline (open-ended items)?
- What happens if the Google Sheet is edited and a horizon value doesn't match the expected enum values?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Google Sheet **RoadmapItems** tab MUST contain all 31 work items from the reference template with correct field values for all columns
- **FR-002**: The Google Sheet **ProvenanceEvents** tab MUST contain 3 events: Seoul24 (Survey, 2024-10-01, 23 participants), Antwerp25 (Workshop, 2025-10-01, 16 participants), Vienna26 (Forum, 2026-04-01, 9 participants)
- **FR-003**: The Google Sheet **MemberPriorities** tab MUST contain 5 ranked priorities with response counts and percentages matching the Seoul 2024 survey
- **FR-004**: Each roadmap item MUST have `provenanceChips` encoded using the pipe-delimited `shortCode:referenceNumber` format (e.g. `Seoul24:2|Antwerp25`)
- **FR-005**: Each roadmap item MUST have `deliveryPeriods` encoded using the pipe-delimited `periodLabel:barStyle` format (e.g. `H1 2026:Active|H2 2026:Active`)
- **FR-006**: Items with no delivery periods (Under Assessment, some In Maintenance) MUST have empty `deliveryPeriods` field
- **FR-007**: Items with `siStatus=Paused` MUST be assigned to `horizon=UnderAssessment`
- **FR-008**: Items with `siStatus=Deferred` MUST be assigned to `horizon=UnderAssessment`
- **FR-009**: Items with no SI activity yet MUST be assigned to `horizon=UnderAssessment`
- **FR-010**: All activityType values MUST match the defined enum: MemberDriven, Collaboration, CRG, Authoring, QAProgramme, Maintenance — items using non-standard labels from the template (e.g., "Working Group", "Project Group", "Collaborative Authoring", "Extension") MUST be mapped to the nearest enum value
- **FR-011**: Timeline bar styles MUST correctly encode: solid active bars as `Active`, dashed/amber planned bars as `Planned`, grey assessment bars as `Assessment`, open-ended ongoing bars as `Ongoing`
- **FR-012**: The `displayOrder` field MUST be set per item to control sort order within each horizon group, matching the reference template's visual order

### Key Entities

- **ProvenanceEvent**: 3 records — Seoul24, Antwerp25, Vienna26 — with correct shortCode, displayLabel, eventType, eventDate, participantCount
- **RoadmapItem**: 31 records across all horizons; each with all 16 columns populated per the data format spec
- **MemberPriority**: 5 records ranked 1–5 with survey data from Seoul 2024
- **ActivityType mapping**: Template labels → application enum values:
  - "Collaborative Authoring" → MemberDriven
  - "Working Group" → Collaboration
  - "Project Group" → Collaboration
  - "QA Programme" → QAProgramme
  - "Collaboration" → Collaboration
  - "CRG" → CRG
  - "Extension" → MemberDriven
  - "Members" → MemberDriven

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 31 roadmap items from the reference template are present in the dashboard with zero omissions
- **SC-002**: Horizon item counts match exactly: Now=12, Next=3, Later=1, UnderAssessment=9, InMaintenance=6
- **SC-003**: All 5 member priorities display with correct rank, response count, and percentage matching the Seoul 2024 survey
- **SC-004**: Filtering by "Seoul '24" origin returns at least 15 items (those tagged in the reference template)
- **SC-005**: Filtering by "Paused" status returns exactly 2 items (Allergies, Microbiology)
- **SC-006**: 100% of items with delivery periods in the reference template have correctly encoded `deliveryPeriods` in the sheet
- **SC-007**: A stakeholder who knows the reference template can verify the dashboard content matches within 5 minutes of review

## Assumptions

- The 31 items extracted from the reference template represent the complete and authoritative set of roadmap content as of the template publication date (May 2026)
- Activity type labels in the reference template that don't exactly match the application enum are mapped using the mapping table in FR-010; edge cases are resolved to the nearest semantic match
- Delivery period bar styles (Active/Planned/Assessment/Ongoing) are inferred from the visual representation in the reference template (solid green=Active, dashed amber=Planned, grey=Assessment)
- Items listed under "Under Assessment" in the reference template include: Paused items (Allergies, Microbiology), Deferred items (Preventive Care), and Not Yet Assessed items (Interventions, Measurement Procedures, Functioning, Outpatient Procedures, Cardiology Disorders, Surveillance)
- The `displayOrder` values are assigned based on the visual top-to-bottom order of items within each horizon group in the reference template
- Evidence data for Antwerp '25 and Vienna '26 is stored as structured summaries; the full poster/group detail is preserved in the themes and priorityShifts JSON fields
- The Google Sheet is the single source of truth; the reference template HTML is used only as the data source for this one-time import
- Ongoing items that extend beyond the visible timeline (2029+) are encoded with a single `Ongoing` bar style delivery period
