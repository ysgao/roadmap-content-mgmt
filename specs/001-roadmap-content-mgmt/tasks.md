# Tasks: Roadmap Content Management Application

**Input**: Design documents from `specs/001-roadmap-content-mgmt/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US6 matching spec.md)

## Path Conventions

Web app layout: `backend/` (Express API) and `frontend/` (React SPA) at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo structure, both projects, tooling.

- [x] T001 Create root project structure: `backend/`, `frontend/`, root `package.json` (workspace), `.env.example` files
- [x] T002 Initialize backend: `npm init`, TypeScript config, `tsconfig.json`, add Express + Prisma + Passport + express-session dependencies in `backend/package.json`
- [x] T003 [P] Initialize frontend: Vite + React + TypeScript scaffold, add Zustand + React Router dependencies in `frontend/package.json`
- [x] T004 [P] Configure backend ESLint + Prettier in `backend/.eslintrc.json` and `backend/.prettierrc`
- [x] T005 [P] Configure frontend ESLint + Prettier in `frontend/.eslintrc.json` and `frontend/.prettierrc`

**Checkpoint**: Both projects initialize and their dev commands (`npm run dev`) start without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Write complete Prisma schema (all 7 entities + enums from data-model.md) in `backend/prisma/schema.prisma`
- [x] T007 Run `prisma migrate dev --name init` and verify DB connection via `prisma studio` in `backend/`
- [x] T008 [P] Set up Express server with JSON parsing, CORS (allow frontend origin), error handler middleware, and request logger in `backend/src/index.ts` and `backend/src/api/middleware/errorHandler.ts`
- [x] T009 [P] Configure Vite dev proxy (`/api` → `http://localhost:3001`) and base router skeleton in `frontend/vite.config.ts`
- [x] T010 Implement auth middleware: Passport.js OIDC strategy + `MOCK_AUTH=true` dev bypass (auto-admin) in `backend/src/api/middleware/auth.ts`
- [x] T011 Implement auth routes (`/auth/login`, `/auth/callback`, `/auth/logout`, `/auth/me`) in `backend/src/api/routes/auth.ts`
- [x] T012 Stub all 5 API resource routers (roadmap-items, timeline, member-priorities, provenance-events, evidence) and mount on `/api/v1` in `backend/src/api/routes/index.ts`
- [x] T013 [P] Implement typed API client fetch wrappers for all 5 resource groups in `frontend/src/services/api.ts`
- [x] T014 [P] Implement auth service: session state, `useAuth` hook, login/logout, `/auth/me` fetch in `frontend/src/services/auth.ts`
- [x] T015 [P] Initialize Zustand filter store (origin, siStatus, activityType, reset action) in `frontend/src/store/filterStore.ts`
- [x] T016 [P] Set up React Router with routes for `/`, `/timeline`, `/admin`, `/login` in `frontend/src/main.tsx`

**Checkpoint**: Backend starts and responds to `GET /api/v1` with 200; frontend dev server loads blank pages at all routes.

---

## Phase 3: User Story 1 — View Roadmap Dashboard (Priority: P1) 🎯 MVP

**Goal**: Users see all roadmap items grouped by horizon (Now/Next/Later/Under Assessment/In Maintenance) with item counts and full card details.

**Independent Test**: Run `npm run seed` then load `http://localhost:5173` — all horizons appear with correct item counts; each card shows status badge, impact, title, ask, activity type, and provenance chips.

### Implementation for User Story 1

- [x] T017 Implement `RoadmapService.getAll()` — fetch items grouped by horizon with provenance chips and delivery periods in `backend/src/services/roadmapService.ts`
- [x] T018 [US1] Implement `GET /api/v1/roadmap-items` route handler (calls `RoadmapService.getAll()`) in `backend/src/api/routes/roadmapItems.ts`
- [x] T019 [P] [US1] Create `StatusBadge` component (Active/Planned/Paused/Deferred color mapping) in `frontend/src/components/shared/StatusBadge.tsx`
- [x] T020 [P] [US1] Create `ImpactBadge` component (High/Medium/Low color mapping) in `frontend/src/components/shared/ImpactBadge.tsx`
- [x] T021 [P] [US1] Create `ActivityTag` component (6 activity types with distinct background colors) in `frontend/src/components/shared/ActivityTag.tsx`
- [x] T022 [P] [US1] Create `ProvenanceChip` component (shortCode + optional referenceNumber display) in `frontend/src/components/shared/ProvenanceChip.tsx`
- [x] T023 [US1] Create `RoadmapCard` component (expandable card with all fields: title, ask, status, impact, activity, trigger, progress, addressed, milestone, provenance chips) in `frontend/src/components/dashboard/RoadmapCard.tsx`
- [x] T024 [US1] Create `HorizonGroup` component (horizon label, item count badge, list of `RoadmapCard`) in `frontend/src/components/dashboard/HorizonGroup.tsx`
- [x] T025 [US1] Create `DashboardPage` (fetches `GET /roadmap-items`, renders 5 `HorizonGroup` sections) in `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Full read-only dashboard works with seeded data. User Story 1 independently testable.

---

## Phase 4: User Story 3 — Manage Roadmap Items (Priority: P1)

**Goal**: Authenticated admins can create, edit, and delete roadmap items; changes appear immediately on the dashboard.

**Independent Test**: Log in as admin → create a new item with all required fields → it appears in the correct horizon. Edit a field → change visible on dashboard. Delete it → item gone.

### Implementation for User Story 3

- [x] T026 [P] Implement `RoadmapService.create()` with validation (required fields, impactRating required when Active) in `backend/src/services/roadmapService.ts`
- [x] T027 [P] Implement `RoadmapService.update()` (replace all fields + re-link provenance + delivery periods) in `backend/src/services/roadmapService.ts`
- [x] T028 [P] Implement `RoadmapService.delete()` (cascades via Prisma) in `backend/src/services/roadmapService.ts`
- [x] T029 Implement `POST /api/v1/roadmap-items` route with auth guard + field validation in `backend/src/api/routes/roadmapItems.ts`
- [x] T030 Implement `PUT /api/v1/roadmap-items/:id` route with auth guard in `backend/src/api/routes/roadmapItems.ts`
- [x] T031 Implement `DELETE /api/v1/roadmap-items/:id` route with auth guard in `backend/src/api/routes/roadmapItems.ts`
- [x] T032 Implement `GET /api/v1/roadmap-items/:id` route handler in `backend/src/api/routes/roadmapItems.ts`
- [x] T033 [P] Implement `ProvenanceEventService.getAll()` and `GET /api/v1/provenance-events` route in `backend/src/services/provenanceEventService.ts` and `backend/src/api/routes/provenanceEvents.ts`
- [x] T034 [P] Implement `POST /api/v1/provenance-events` + `PUT /api/v1/provenance-events/:id` routes with auth guard in `backend/src/api/routes/provenanceEvents.ts`
- [x] T035 [P] [US3] Create `LoginPage` (shows "Sign in with org account" button → redirects to `/auth/login`) in `frontend/src/pages/LoginPage.tsx`
- [x] T036 [P] [US3] Create `ItemForm` component (all RoadmapItem fields, provenance chip multi-select, delivery period entries, field-level validation errors) in `frontend/src/components/admin/ItemForm.tsx`
- [x] T037 [US3] Create `DeleteConfirm` component (modal: "Delete this item? This cannot be undone.") in `frontend/src/components/admin/DeleteConfirm.tsx`
- [x] T038 [US3] Create `AdminPage` (lists all roadmap items, Create/Edit/Delete controls, auth guard redirect to `/login`) in `frontend/src/pages/AdminPage.tsx`
- [x] T039 [US3] Wire admin save/delete to API: call `POST`/`PUT`/`DELETE` endpoints, refresh dashboard data on success in `frontend/src/pages/AdminPage.tsx`

**Checkpoint**: Admin CRUD fully functional. User Story 3 independently testable (separate from filter/timeline).

---

## Phase 5: User Story 2 — Filter Roadmap Items (Priority: P2)

**Goal**: Users filter the dashboard by origin event, SI status, and activity type; dashboard updates instantly; Reset restores all items.

**Independent Test**: Load dashboard → select "Seoul '24" filter → only Seoul-tagged items remain; counts update. Click Reset → all items return.

### Implementation for User Story 2

- [x] T040 Update `RoadmapService.getAll()` to accept and apply `origin`, `siStatus`, `activityType` query params in `backend/src/services/roadmapService.ts`
- [x] T041 [US2] Update `GET /api/v1/roadmap-items` to pass query params to service in `backend/src/api/routes/roadmapItems.ts`
- [x] T042 [P] [US2] Create `FilterBar` component (dropdowns for origin/siStatus/activityType + Reset button) in `frontend/src/components/dashboard/FilterBar.tsx`
- [x] T043 [US2] Connect `FilterBar` to Zustand `filterStore` (selections update store, Reset dispatches reset action) in `frontend/src/components/dashboard/FilterBar.tsx`
- [x] T044 [US2] Update `DashboardPage` to read `filterStore` and re-fetch `GET /roadmap-items` with active filter params on change in `frontend/src/pages/DashboardPage.tsx`
- [x] T045 [US2] Populate FilterBar origin dropdown from `GET /api/v1/provenance-events` in `frontend/src/components/dashboard/FilterBar.tsx`

**Checkpoint**: All filter combinations work; Reset restores full list; item counts per horizon reflect filtered results. User Story 2 independently testable.

---

## Phase 6: User Story 4 — View Timeline Visualization (Priority: P2)

**Goal**: Users see a Gantt-style horizontal chart with each roadmap item's delivery window across H1 2026–2029+ periods; bar styles indicate commitment status.

**Independent Test**: Load `/timeline` — items with delivery periods show bars spanning correct period columns; Active items have solid bars, Planned items have dashed/amber bars, Assessment items have grey bars.

### Implementation for User Story 4

- [x] T046 Implement `TimelineService.getAll()` — return items with delivery periods sorted by horizon in `backend/src/services/timelineService.ts`
- [x] T047 [US4] Implement `GET /api/v1/timeline` route handler in `backend/src/api/routes/timeline.ts`
- [x] T048 [P] [US4] Create `PeriodBar` SVG component (props: barStyle → renders solid/dashed/amber/grey bar spanning defined periods) in `frontend/src/components/timeline/PeriodBar.tsx`
- [x] T049 [US4] Create `GanttTimeline` SVG component (fixed period columns H1 2026–2029+, item rows with horizon grouping, `PeriodBar` per item) in `frontend/src/components/timeline/GanttTimeline.tsx`
- [x] T050 [US4] Create `TimelinePage` (fetches `GET /timeline`, renders `GanttTimeline`) in `frontend/src/pages/TimelinePage.tsx`
- [x] T051 [US4] Add "Timeline" navigation link from `DashboardPage` header in `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Timeline page loads and renders all items with delivery periods; bar styles visually distinct. User Story 4 independently testable.

---

## Phase 7: User Story 5 — View Top Member Priorities (Priority: P3)

**Goal**: Users see a ranked list (1–5) of top member priority areas with response data, current SI activity, progress, milestones, and risks.

**Independent Test**: Load dashboard → scroll to Member Priorities section → 5 ranked entries appear with all fields populated from seeded data.

### Implementation for User Story 5

- [x] T052 Implement `MemberPriorityService.getAll()` (ordered by rank, includes provenance events) in `backend/src/services/memberPriorityService.ts`
- [x] T053 [US5] Implement `GET /api/v1/member-priorities` route handler in `backend/src/api/routes/memberPriorities.ts`
- [x] T054 [P] [US5] Create `PriorityCard` component (expandable: rank badge, title, response count/%, provenance chips, SI activity, progress, milestones, risks) in `frontend/src/components/priorities/PriorityCard.tsx`
- [x] T055 [US5] Create `MemberPrioritiesList` component (renders 5 `PriorityCard` in rank order) in `frontend/src/components/priorities/MemberPrioritiesList.tsx`
- [x] T056 [US5] Add `MemberPrioritiesList` section to `DashboardPage` below horizon groups in `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Top 5 member priorities section renders with all data. User Story 5 independently testable.

---

## Phase 8: User Story 6 — Manage Evidence & Input Data (Priority: P3)

**Goal**: Authenticated admins can add and update evidence inputs (survey results, workshop themes, priority shifts) and member priority entries.

**Independent Test**: Log in as admin → add new evidence for a provenance event → it appears in the Evidence section with correct fields. Update member priority rank 1 progress → change visible on dashboard.

### Implementation for User Story 6

- [x] T057 Implement `EvidenceService.getAll()`, `.create()`, `.update()` in `backend/src/services/evidenceService.ts`
- [x] T058 Implement `GET /api/v1/evidence`, `POST /api/v1/evidence`, `PUT /api/v1/evidence/:id` routes with auth guard in `backend/src/api/routes/evidence.ts`
- [x] T059 Implement `MemberPriorityService.create()`, `.update()`, `.delete()` in `backend/src/services/memberPriorityService.ts`
- [x] T060 Implement `POST /api/v1/member-priorities`, `PUT /api/v1/member-priorities/:id`, `DELETE /api/v1/member-priorities/:id` routes with auth guard in `backend/src/api/routes/memberPriorities.ts`
- [x] T061 [P] [US6] Create `EvidenceForm` component (fields: provenanceEvent select, summary, rankedGaps JSON editor, themes list, priorityShifts list, groupCount) in `frontend/src/components/evidence/EvidenceForm.tsx`
- [x] T062 [P] [US6] Create `PriorityForm` component (fields: rank, topicTitle, responseCount, responsePercentage, currentSIActivity, progressSummary, nextMilestones, riskFactors, provenanceEvents multi-select) in `frontend/src/components/admin/PriorityForm.tsx`
- [x] T063 [US6] Create `EvidenceTab` component (lists all evidence inputs with edit controls) in `frontend/src/components/evidence/EvidenceTab.tsx`
- [x] T064 [US6] Add Evidence and Member Priority management panels to `AdminPage` in `frontend/src/pages/AdminPage.tsx`

**Checkpoint**: Admin can fully manage evidence and member priorities. User Story 6 independently testable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories; production hardening.

- [x] T065 [P] Create `Glossary` component (horizons, activity types, status badges, triggers, provenance chips explained) in `frontend/src/components/shared/Glossary.tsx`
- [x] T066 [P] Add `Glossary` section to `DashboardPage` in `frontend/src/pages/DashboardPage.tsx`
- [x] T067 [P] Write seed script with reference roadmap data (all items from the SNOMED CT Content Roadmap page) in `backend/prisma/seed.ts`
- [x] T068 [P] Add input validation middleware (sanitize string inputs, block XSS) in `backend/src/api/middleware/validate.ts`
- [x] T069 [P] Add rate limiting middleware (protect write endpoints) in `backend/src/api/middleware/rateLimiter.ts`
- [x] T070 Configure Express to serve `frontend/dist/` static assets in production mode in `backend/src/index.ts`
- [x] T071 [P] Write Playwright E2E test for filter flow (apply filter → verify results → reset) in `frontend/tests/e2e/filter.spec.ts`
- [x] T072 [P] Write Playwright E2E test for admin CRUD flow (create → edit → delete item) in `frontend/tests/e2e/admin.spec.ts`
- [x] T073 Run quickstart.md validation: follow each step from scratch and fix any gaps in `specs/001-roadmap-content-mgmt/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1 Dashboard)**: Depends on Phase 2 — **MVP delivery point**
- **Phase 4 (US3 Admin CRUD)**: Depends on Phase 2; Phase 3 recommended first (admin edits what dashboard shows)
- **Phase 5 (US2 Filters)**: Depends on Phase 2; Phase 3 should be complete (filtering an empty dashboard has no value)
- **Phase 6 (US4 Timeline)**: Depends on Phase 2; independent of Phases 3–5
- **Phase 7 (US5 Priorities)**: Depends on Phase 2; independent of Phases 3–6
- **Phase 8 (US6 Evidence Mgmt)**: Depends on Phase 4 (admin pattern established) and Phase 7 (priorities exist to manage)
- **Phase 9 (Polish)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1 — Dashboard)**: After Foundational only — no story dependencies
- **US3 (P1 — Manage Items)**: After Foundational; US1 recommended (edits need something to show)
- **US2 (P2 — Filters)**: After Foundational + US1 (filters meaningless without data to filter)
- **US4 (P2 — Timeline)**: After Foundational only — independent of other stories
- **US5 (P3 — Priorities)**: After Foundational only — independent of other stories
- **US6 (P3 — Evidence Mgmt)**: After Foundational + US4 admin pattern (T033–T039); US5 recommended

### Within Each User Story

- Service layer (backend) before route handler
- Route handler before frontend API client usage
- Shared components (StatusBadge, ImpactBadge, etc.) before card/page components
- Page component last (assembles all children)

---

## Parallel Opportunities

### Phase 2 Parallel Batch

```
T008  Set up Express server + middleware
T009  Configure Vite proxy
T013  Typed API client wrappers
T014  Auth service
T015  Zustand filter store
T016  React Router setup
```

### Phase 3 Parallel Batch (after T017–T018 backend done)

```
T019  StatusBadge
T020  ImpactBadge
T021  ActivityTag
T022  ProvenanceChip
```
Then: T023 (RoadmapCard) → T024 (HorizonGroup) → T025 (DashboardPage)

### Phase 4 Parallel Batch

```
T026  RoadmapService.create()
T027  RoadmapService.update()
T028  RoadmapService.delete()
T033  ProvenanceEventService + GET route
T034  POST/PUT provenance routes
T035  LoginPage
T036  ItemForm
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — **cannot skip**
3. Complete Phase 3 (US1 — View Dashboard)
4. **STOP AND VALIDATE**: Load seeded dashboard, verify all horizons, cards, badges
5. Demo to stakeholders

### Incremental Delivery

1. Setup + Foundational → working infrastructure
2. US1 → read-only public dashboard (MVP)
3. US3 → admin can author content
4. US2 → filters active on dashboard
5. US4 → timeline view live
6. US5 → member priorities section
7. US6 → full evidence management

### Parallel Team Strategy

After Phase 2 completes:
- **Developer A**: Phase 3 (US1) + Phase 5 (US2)
- **Developer B**: Phase 4 (US3 admin)
- **Developer C**: Phase 6 (US4 timeline) + Phase 7 (US5 priorities)

---

## Notes

- `[P]` = different files, no incomplete-task dependencies, safe to parallelize
- `[USN]` = maps task to user story N for traceability
- Each phase's **Checkpoint** = independently testable delivery increment
- Use `MOCK_AUTH=true` in dev to bypass OIDC during US3 development
- Admin form UX: inline validation errors per field (not alert dialogs)
- Commit after each Checkpoint at minimum
