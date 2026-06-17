# Implementation Plan: Jira Ticket Linking + Optional Authentication

**Branch**: `003-jira-ticket-linking` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-jira-ticket-linking/spec.md`

## Summary

Extend the existing Roadmap CMS to: (1) add optional Keycloak sign-in scoped to the Jira panel only — the public dashboard remains accessible to all visitors, matching the reference template's public commitment; (2) display live Jira ticket details on roadmap cards for authenticated SNOMED staff by proxying Atlassian REST API calls through a new minimal backend service on Render; (3) add a `jiraTickets` column to the Google Sheet. GitHub Pages deployment unchanged for the SPA.

## Technical Context

**Language/Version**: TypeScript (existing — backend + frontend)

**Primary Dependencies**:
- Backend: Express (existing) + Passport.js + passport-openidconnect (already in `backend/package.json`) + node-fetch (Jira proxy)
- Frontend: React (existing) + existing Zustand store (extend with Jira filter state)
- Auth: SNOMED International Keycloak (OIDC) — `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` env vars already defined in `backend/.env.example`
- Jira: Atlassian REST API v3 — service account API token, Basic auth

**Storage**: Google Sheets (existing, add `jiraTickets` column) — no DB changes

**Testing**: Manual integration testing (Keycloak redirect, Jira proxy response)

**Target Platform**: GitHub Pages (SPA, unchanged) + Render (Jira proxy backend, new minimal service — no Docker, Node.js native)

**Performance Goals**: Auth redirect round-trip under 15 seconds; Jira ticket fetch under 2 seconds per card expansion

**Constraints**:
- No Docker
- Jira API calls MUST be proxied server-side — credentials never exposed to browser
- GitHub Pages stays for the public SPA; Render backend handles only Jira proxy + auth
- Keycloak OIDC credentials must be supplied by SNOMED IT team

**Scale/Scope**: ~50 concurrent authenticated users, up to 5 Jira tickets per roadmap card

## Constitution Check

*OntoGraph Editor constitution governs a VS Code extension — not applicable to this web application.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec first | PASS | spec.md complete and validated |
| Plan validation before tasks | PASS | This document |
| Task atomicity | PENDING | Enforced during /speckit-tasks |

## Project Structure

### Documentation (this feature)

```text
specs/003-jira-ticket-linking/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 type changes
├── quickstart.md        # Updated dev setup
├── contracts/api.md     # New Jira proxy endpoint + auth changes
└── tasks.md             # /speckit-tasks output
```

### Source Code Changes (project root)

```text
backend/src/
├── api/
│   ├── middleware/auth.ts        # Extend: add auth guard to Jira route only (public routes unchanged)
│   └── routes/
│       ├── index.ts              # Add /jira router mount
│       └── jira.ts               # NEW: Jira proxy route handler
└── services/
    └── jiraService.ts            # NEW: Atlassian REST API v3 client

frontend/src/
├── components/dashboard/
│   └── JiraTickets.tsx           # NEW: expandable linked tickets panel
├── pages/DashboardPage.tsx       # Extend: auth gate redirect, Jira filter
├── services/
│   ├── api.ts                    # Extend: add getJiraTickets()
│   └── auth.ts                   # Extend: real session check, login redirect
├── store/filterStore.ts          # Extend: add hasActiveJira boolean (status-based, requires auth)
└── types.ts                      # Extend: JiraTicket type, jiraTickets on RoadmapItem

render.yaml                       # NEW: Render deployment config
```

## Complexity Tracking

No constitution violations requiring justification.

---

## Phase 0: Research

See [research.md](./research.md) for full decision rationale.

| # | Area | Decision |
|---|------|----------|
| 1 | Auth architecture | Passport.js OIDC — applied to Jira proxy route only; public routes unchanged |
| 2 | Jira access | Server-side proxy with service account API token |
| 3 | Deployment | Render (Node.js native, no Docker) |
| 4 | Sheet column | `jiraTickets` as column 17, pipe-separated keys |
| 5 | Jira filter state | Extend Zustand filterStore with `hasActiveJira` flag — status-based filter requiring auth |

---

## Phase 1: Design

See generated artifacts:
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api.md](./contracts/api.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
