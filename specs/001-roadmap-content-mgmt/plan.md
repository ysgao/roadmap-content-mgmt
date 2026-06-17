# Implementation Plan: Roadmap Content Management Application

**Branch**: `001-roadmap-content-mgmt` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-roadmap-content-mgmt/spec.md`

## Summary

Build a web-based content management application that replicates and extends the SNOMED CT Content Development Roadmap dashboard (https://ihtsdo.github.io/snomed-international-resources/dashboards/content-roadmap.html). The app provides a read-only public dashboard with horizon-grouped roadmap cards, Gantt timeline, filtering, member priorities, and evidence sections — plus an authenticated admin interface for creating, editing, and deleting all roadmap content. The reference template is a static HTML file; this application adds a backend data store and admin authoring layer.

## Technical Context

**Language/Version**: TypeScript (frontend + backend)

**Primary Dependencies**:
- Frontend: React 18 + Vite (fast build, aligned with current web standards)
- Backend: Node.js + Express (lightweight REST API)
- Auth: Passport.js with OAuth2/OIDC strategy (matches assumption of existing org identity provider)
- Storage: PostgreSQL (relational structure suits entity relationships; supports concurrent writes)
- ORM: Prisma (type-safe schema-first ORM, works with PostgreSQL)
- Timeline viz: native SVG/Canvas (custom rendering to match reference template's Gantt style exactly)

**Storage**: PostgreSQL (hosted, e.g., Railway or self-managed)

**Testing**: Vitest (unit + integration), Playwright (E2E for filter/admin flows)

**Target Platform**: Web — modern desktop browsers (Chrome, Firefox, Safari, Edge); no mobile requirement for v1

**Project Type**: Web application (React SPA frontend + Express REST API backend)

**Performance Goals**: Dashboard load <3 seconds; filter updates <1 second; admin save <2 seconds

**Constraints**: Public read access (no auth for viewing); write operations require authenticated admin session; timeline must faithfully reproduce H1/H2 YYYY period structure from reference

**Scale/Scope**: ~50–200 roadmap items, <1000 users, <20 concurrent admins

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> **Note**: The loaded constitution (`~/.specify/memory/constitution.md`) governs the OntoGraph Editor VS Code extension project and specifies VS Code-specific constraints (IPC bridge, webview paths, Angular routing). Those constraints do **not** apply to this standalone web application. No constitution violations are present. The three applicable development workflow gates from the constitution are:

| Gate | Status | Notes |
|------|--------|-------|
| Spec First: no implementation without valid spec.md | PASS | spec.md complete and validated |
| Plan Validation before task breakdown | PASS | This document fulfills that requirement |
| Task Atomicity: each task = single verifiable unit | PENDING | Will be enforced during /speckit-tasks |

## Project Structure

### Documentation (this feature)

```text
specs/001-roadmap-content-mgmt/
├── plan.md              # This file
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 entity/schema definitions
├── quickstart.md        # Phase 1 developer setup guide
├── contracts/           # Phase 1 API endpoint contracts
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma         # Data model (entities → DB tables)
├── src/
│   ├── models/               # Prisma-generated types + domain types
│   ├── services/             # Business logic (roadmap, evidence, priorities)
│   ├── api/
│   │   ├── routes/           # Express route handlers per resource
│   │   └── middleware/       # Auth guard, error handler, validation
│   └── index.ts              # Server entrypoint
└── tests/
    ├── integration/          # API route tests with test DB
    └── unit/                 # Service logic tests

frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/        # HorizonGroup, RoadmapCard, FilterBar, ItemCount
│   │   ├── timeline/         # GanttTimeline, PeriodBar
│   │   ├── priorities/       # MemberPrioritiesList, PriorityCard
│   │   ├── evidence/         # EvidenceTab, EventEntry
│   │   ├── admin/            # ItemForm, EvidenceForm, PriorityForm, DeleteConfirm
│   │   └── shared/           # StatusBadge, ImpactBadge, ProvenanceChip, ActivityTag
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── TimelinePage.tsx
│   │   ├── AdminPage.tsx
│   │   └── LoginPage.tsx
│   ├── services/
│   │   ├── api.ts            # Typed fetch wrappers for all endpoints
│   │   └── auth.ts           # Auth state, login/logout, session
│   ├── store/                # Lightweight state (Zustand) for filter + data
│   └── main.tsx
└── tests/
    ├── e2e/                  # Playwright: filter flows, admin CRUD
    └── unit/                 # Component + hook tests (Vitest)
```

**Structure Decision**: Web application (Option 2) — separate `frontend/` and `backend/` directories. Frontend is a React SPA served statically; backend is an Express REST API. Both are TypeScript. The SPA fetches data from the API; authentication state is managed by JWT session cookies issued by the backend OAuth2 callback handler.

## Complexity Tracking

No constitution violations requiring justification.

---

## Phase 0: Research

*Resolved unknowns and technology decisions documented below.*

### Decision 1: Frontend Framework

**Decision**: React 18 with Vite

**Rationale**: The reference template is a complex interactive dashboard with multiple filter dimensions and expandable cards. React's component model maps cleanly to the card/filter/timeline structure. Vite provides fast development cycle. Alternative (Vue 3) would work equally well but React has wider ecosystem for Gantt/timeline components if custom SVG proves insufficient.

**Alternatives considered**:
- Vue 3: Comparable but smaller ecosystem for data viz; React chosen for broader hiring pool
- Vanilla JS (no framework): Reference is static HTML, but admin CRUD forms and reactive filtering make unmanaged DOM impractical
- Next.js (SSR): Overkill for this scale; public pages don't need SEO optimization; adds deployment complexity

### Decision 2: Backend Framework + Storage

**Decision**: Express + PostgreSQL + Prisma

**Rationale**: Express is minimal and well-understood; the API surface is bounded (7–8 resource endpoints). PostgreSQL handles relational data with foreign keys between roadmap items, provenance events, and evidence. Prisma gives type-safe DB access with migration support. For v1 scale (<200 items, <20 admins), this is straightforward to operate.

**Alternatives considered**:
- SQLite (file-based): Simpler deployment but no concurrent write safety for multi-admin scenarios; ruled out
- MongoDB: Document model fits card-like data, but relational joins for provenance/evidence are cleaner in PostgreSQL
- Supabase/Firebase (BaaS): Reduces backend code but introduces vendor lock-in and limits custom auth integration with org SSO

### Decision 3: Authentication

**Decision**: Passport.js with OIDC strategy (OAuth2/OIDC against org identity provider)

**Rationale**: Spec assumption states the org has an existing identity provider using standard OAuth2/SSO. Passport.js is the standard Node.js auth middleware with OIDC support. Sessions stored server-side (express-session + PostgreSQL session store) with JWT-signed cookies for stateless admin verification on each request.

**Alternatives considered**:
- Auth0 / managed auth: Adds external dependency and cost; org already has IdP
- DIY JWT (no library): Higher implementation risk for auth security; rejected
- NextAuth: Ties to Next.js; not applicable here

### Decision 4: Timeline Visualization

**Decision**: Custom SVG rendered in React

**Rationale**: The reference template's Gantt uses a specific visual language (solid/dashed/amber bars, grey assessment bars, H1/H2 YYYY period columns). Pre-built Gantt libraries impose their own styling and interaction models that would require extensive overriding. Custom SVG gives exact control over visual fidelity to the reference template. The scale (50–200 items) is well within SVG performance limits.

**Alternatives considered**:
- react-gantt-chart / dhtmlx-gantt: Complex overrides needed to match reference styling
- Canvas rendering: More performant at 10k+ items, unnecessary at this scale
- CSS Grid timeline: Less precise for period-based rendering; SVG preferred

### Decision 5: State Management (Filters)

**Decision**: Zustand (lightweight global state)

**Rationale**: Filter state (active origin, status, activity type) needs to be shared between the FilterBar component and all HorizonGroup/RoadmapCard components. Zustand provides this with minimal boilerplate. Redux would be excessive for this use case.

**Alternatives considered**:
- React Context + useReducer: Viable but verbose for multiple independent filter dimensions
- URL query params only: Good for shareability; combine with Zustand for in-memory reactivity
- Redux Toolkit: Correct pattern but boilerplate overhead unjustified at this scale

---

## Phase 1: Design & Contracts

*See generated artifacts:*
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api.md](./contracts/api.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
