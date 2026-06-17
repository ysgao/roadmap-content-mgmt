# Data Model: Roadmap Content Management Application

**Date**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

## Entities & Relationships

```
RoadmapItem ──< ItemProvenanceLink >── ProvenanceEvent
RoadmapItem ──< DeliveryPeriod
MemberPriority ──< PriorityProvenanceLink >── ProvenanceEvent
EvidenceInput ──> ProvenanceEvent (1:1)
Administrator (via external IdP — no local user table needed for v1)
```

---

## Entity: RoadmapItem

Primary content card displayed on the dashboard.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| title | string | required, max 200 | Card heading |
| askDescription | text | required | What was requested |
| siStatus | enum | required | Active / Planned / Paused / Deferred |
| impactRating | enum | nullable | High / Medium / Low |
| horizon | enum | required | Now / Next / Later / UnderAssessment / InMaintenance |
| activityType | enum | required | MemberDriven / Collaboration / CRG / Authoring / QAProgramme / Maintenance |
| timelineClassification | enum | required | Project / Continuous |
| trigger | string | nullable, max 200 | Why work is happening |
| progressNarrative | text | nullable | Current status narrative |
| addressedStatus | enum | nullable | Yes / Partially / No |
| nextMilestoneDate | date | nullable | |
| implementationNotes | text | nullable | Risks / notes |
| displayOrder | integer | default 0 | Sort order within horizon group |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |

**State transitions** (siStatus):
- Draft → Active → Paused → Active (cycle)
- Active → Deferred
- Planned → Active
- Any → Deferred / Paused

**Validation rules**:
- `addressedStatus` only meaningful when `siStatus` is Active or Paused
- `impactRating` required when `siStatus` is Active
- `nextMilestoneDate` must be a future or present date

---

## Entity: DeliveryPeriod

Represents a single half-year bar segment on the Gantt timeline for a roadmap item.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| roadmapItemId | UUID | FK → RoadmapItem, cascade delete | |
| periodLabel | string | required, e.g. "H1 2026" | Display label |
| periodYear | integer | required | e.g. 2026 |
| periodHalf | enum | required | H1 / H2 |
| barStyle | enum | required | Active / Planned / Assessment / Ongoing |
| createdAt | timestamp | auto | |

**Constraints**:
- One roadmap item may have multiple delivery periods (spanning a range)
- `barStyle` maps to visual rendering: Active=solid, Planned=dashed/amber, Assessment=grey, Ongoing=open-ended bar

---

## Entity: ProvenanceEvent

Reference input events (surveys, workshops, forums) that can be linked to roadmap items and evidence.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| shortCode | string | unique, required, max 20 | e.g. "Seoul24", "Antwerp25", "Vienna26" |
| displayLabel | string | required, max 100 | e.g. "Seoul '24" |
| eventType | enum | required | Survey / Workshop / Forum |
| eventDate | date | required | |
| participantCount | integer | nullable | Number of participants/countries |
| createdAt | timestamp | auto | |

---

## Entity: ItemProvenanceLink

Junction table linking roadmap items to provenance events (the "chips" on each card).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| roadmapItemId | UUID | FK → RoadmapItem, cascade delete | |
| provenanceEventId | UUID | FK → ProvenanceEvent | |
| referenceNumber | integer | nullable | e.g. "#3" in "Seoul '24 #3" |

**Constraints**: unique on (roadmapItemId, provenanceEventId, referenceNumber)

---

## Entity: MemberPriority

Ranked member priorities from surveys (Top 5 section).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| rank | integer | required, 1–5, unique | Survey rank |
| topicTitle | string | required, max 200 | Priority area name |
| responseCount | integer | required | Number of responses |
| responsePercentage | decimal(5,2) | required | Percentage of respondents |
| currentSIActivity | text | nullable | What SI is currently doing |
| progressSummary | text | nullable | |
| nextMilestones | text | nullable | |
| riskFactors | text | nullable | |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |

---

## Entity: PriorityProvenanceLink

Junction table linking member priorities to provenance events (conference signals).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| memberPriorityId | UUID | FK → MemberPriority, cascade delete | |
| provenanceEventId | UUID | FK → ProvenanceEvent | |

---

## Entity: EvidenceInput

Structured findings from each member input event.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | |
| provenanceEventId | UUID | FK → ProvenanceEvent, unique | 1:1 with event |
| summary | text | required | High-level summary of findings |
| rankedGaps | jsonb | nullable | Array of {rank, area} from surveys |
| themes | jsonb | nullable | Array of theme strings from workshops |
| priorityShifts | jsonb | nullable | Array of {area, from, to} cross-event deltas |
| groupCount | integer | nullable | Number of groups at forum/workshop |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |

**JSON field schemas**:
- `rankedGaps`: `[{ "rank": 1, "area": "Laboratory" }, ...]`
- `themes`: `["Theme A", "Theme B", ...]`
- `priorityShifts`: `[{ "area": "Substances", "fromRank": 1, "toRank": 2 }, ...]`

---

## Enum Reference

| Enum | Values |
|------|--------|
| SIStatus | Active, Planned, Paused, Deferred |
| ImpactRating | High, Medium, Low |
| Horizon | Now, Next, Later, UnderAssessment, InMaintenance |
| ActivityType | MemberDriven, Collaboration, CRG, Authoring, QAProgramme, Maintenance |
| TimelineClassification | Project, Continuous |
| AddressedStatus | Yes, Partially, No |
| PeriodHalf | H1, H2 |
| BarStyle | Active, Planned, Assessment, Ongoing |
| EventType | Survey, Workshop, Forum |

---

## Prisma Schema (abbreviated)

```prisma
model RoadmapItem {
  id                     String    @id @default(uuid())
  title                  String    @db.VarChar(200)
  askDescription         String    @db.Text
  siStatus               SIStatus
  impactRating           ImpactRating?
  horizon                Horizon
  activityType           ActivityType
  timelineClassification TimelineClassification
  trigger                String?   @db.VarChar(200)
  progressNarrative      String?   @db.Text
  addressedStatus        AddressedStatus?
  nextMilestoneDate      DateTime? @db.Date
  implementationNotes    String?   @db.Text
  displayOrder           Int       @default(0)
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  deliveryPeriods  DeliveryPeriod[]
  provenanceLinks  ItemProvenanceLink[]
}

model DeliveryPeriod {
  id            String    @id @default(uuid())
  roadmapItem   RoadmapItem @relation(fields: [roadmapItemId], references: [id], onDelete: Cascade)
  roadmapItemId String
  periodLabel   String    @db.VarChar(20)
  periodYear    Int
  periodHalf    PeriodHalf
  barStyle      BarStyle
  createdAt     DateTime  @default(now())
}

model ProvenanceEvent {
  id               String    @id @default(uuid())
  shortCode        String    @unique @db.VarChar(20)
  displayLabel     String    @db.VarChar(100)
  eventType        EventType
  eventDate        DateTime  @db.Date
  participantCount Int?
  createdAt        DateTime  @default(now())

  itemLinks        ItemProvenanceLink[]
  priorityLinks    PriorityProvenanceLink[]
  evidenceInput    EvidenceInput?
}

model ItemProvenanceLink {
  id                String    @id @default(uuid())
  roadmapItem       RoadmapItem @relation(fields: [roadmapItemId], references: [id], onDelete: Cascade)
  roadmapItemId     String
  provenanceEvent   ProvenanceEvent @relation(fields: [provenanceEventId], references: [id])
  provenanceEventId String
  referenceNumber   Int?

  @@unique([roadmapItemId, provenanceEventId, referenceNumber])
}

model MemberPriority {
  id                  String   @id @default(uuid())
  rank                Int      @unique
  topicTitle          String   @db.VarChar(200)
  responseCount       Int
  responsePercentage  Decimal  @db.Decimal(5, 2)
  currentSIActivity   String?  @db.Text
  progressSummary     String?  @db.Text
  nextMilestones      String?  @db.Text
  riskFactors         String?  @db.Text
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  provenanceLinks PriorityProvenanceLink[]
}

model PriorityProvenanceLink {
  id                String   @id @default(uuid())
  memberPriority    MemberPriority @relation(fields: [memberPriorityId], references: [id], onDelete: Cascade)
  memberPriorityId  String
  provenanceEvent   ProvenanceEvent @relation(fields: [provenanceEventId], references: [id])
  provenanceEventId String
}

model EvidenceInput {
  id                String   @id @default(uuid())
  provenanceEvent   ProvenanceEvent @relation(fields: [provenanceEventId], references: [id])
  provenanceEventId String   @unique
  summary           String   @db.Text
  rankedGaps        Json?
  themes            Json?
  priorityShifts    Json?
  groupCount        Int?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```
