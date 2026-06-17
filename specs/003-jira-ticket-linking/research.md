# Research: Jira Ticket Linking + Optional Authentication

**Date**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

## Decision Summary

| # | Area | Decision | Status |
|---|------|----------|--------|
| 1 | Auth architecture | Optional auth scoped to Jira panel only; public dashboard unchanged | Resolved |
| 2 | Jira API access | Server-side proxy with service account API token | Resolved |
| 3 | Deployment | GitHub Pages (SPA) + Render (Jira proxy backend only) | Resolved |
| 4 | Google Sheet column | `jiraTickets` column 17, pipe-separated keys | Resolved |
| 5 | Jira filter | Extend Zustand filterStore with `hasLinkedJira` flag, client-side | Resolved |

---

## Decision 1: Auth Architecture (Jira-Only, Optional)

**Decision**: Auth is scoped to the Jira panel only. The public dashboard (Google Sheets data) remains unauthenticated. When a card with Jira tickets is expanded and the user is not signed in, the frontend shows a "Sign in to view Jira details" button. Clicking it triggers `GET /auth/login` (Keycloak redirect). After authentication, the frontend calls `GET /api/v1/jira/tickets?keys=...` which requires a valid session. All other API endpoints and the SPA itself remain public.

**Rationale**: The reference template (https://ihtsdo.github.io/snomed-international-resources/dashboards/content-roadmap.html) is explicitly public — SNOMED International committed to public access at Vienna '26. Restricting the whole app would break that commitment. Scoping auth to the Jira panel only gives SNOMED staff richer operational detail without blocking public transparency.

**GitHub Pages deployment retained**: The SPA (GitHub Pages) calls the Render backend only for Jira proxy requests and auth callbacks. All Google Sheets data is fetched directly from the browser as before.

**Alternatives considered**:
- Whole-app restriction (original decision): Breaks SNOMED's public transparency commitment; ruled out after verifying template is public
- Auth0: Adds external vendor; SNOMED already has Keycloak
- Frontend-only Jira guard with public proxy API: Exposes Jira service account credentials in browser — security risk, ruled out

---

## Decision 2: Jira API Access Pattern

**Decision**: Server-side proxy in `backend/src/services/jiraService.ts`. The backend holds a Jira service account API token (`JIRA_API_TOKEN`, `JIRA_EMAIL`, `JIRA_BASE_URL` env vars). The frontend calls `GET /api/v1/jira/tickets?keys=CRS-1234,CRS-5678` (requires Keycloak session). The backend fans out to `GET /rest/api/3/issue/{key}` per ticket and returns aggregated results.

**Rationale**: Keeps Jira credentials server-side (never in browser). Handles CORS — Atlassian API blocks arbitrary browser origins. Single endpoint keeps the frontend stateless about Jira auth.

**Jira API fields to request**: `summary`, `status.name`, `assignee.displayName`, `priority.name`. Use `?fields=summary,status,assignee,priority` to minimise payload.

**Jira base URL format**: `https://{organisation}.atlassian.net` (e.g., `https://ihtsdo.atlassian.net`)

**Error handling**: 404 key → `{key, error: "Not found"}`. 403 → `{key, error: "Access restricted"}`. 5s timeout → `{key, error: "Unavailable"}`.

**Alternatives considered**:
- Per-user Keycloak to Jira token delegation: Requires Keycloak-Atlassian OIDC federation; uncertain if configured at SNOMED
- Client-side fetch: CORS blocked by Atlassian; exposes token in browser

---

## Decision 3: Deployment Platform

**Decision**: Split deployment — **GitHub Pages** for the public SPA (unchanged), **Render** for the Jira proxy and auth backend (new minimal service).

- **GitHub Pages** (`ysgao.github.io/roadmap-content-mgmt`): React SPA. Fetches Google Sheets GViz directly. Calls Render backend only for Jira proxy and auth.
- **Render** (Node.js, no Docker, free tier): Express backend serves `/auth/*` (Keycloak OIDC callbacks) and `GET /api/v1/jira/tickets` only. `FRONTEND_URL` env var set to GitHub Pages origin for CORS.

**Rationale**: Dashboard is already working on GitHub Pages with no issues. Backend is minimal (2 active routes). Render free tier handles low-frequency Jira proxy calls from ~50 authenticated users easily. No Docker required.

**Alternatives considered**:
- Move all to Render (backend serves SPA): Unnecessary since SPA is public and working on GitHub Pages; adds operational complexity
- GitHub Pages only: Cannot proxy Jira (CORS blocked, credentials exposed)
- Railway: $5/month free credits; viable fallback if Render has issues

---

## Decision 4: Google Sheet jiraTickets Column

**Decision**: Add `jiraTickets` as the 17th column (after `deliveryPeriods`) in the RoadmapItems tab. Format: pipe-separated ticket keys, e.g. `CRS-1234|SCTMD-5678`. Empty or blank = no linked tickets.

**Rationale**: Consistent with existing `provenanceChips` and `deliveryPeriods` encoding. Editors already familiar with the pipe-separated format. Requires only updating the `sheets.ts` parser to read column 17.

**Sheet update**: Add column header `jiraTickets` to row 1. Existing rows remain valid (blank = no tickets).

---

## Decision 5: Jira Filter State

**Decision**: Add `hasLinkedJira: boolean` and `setHasLinkedJira: (v: boolean) => void` to Zustand filterStore. FilterBar gains a "Has Jira tickets" toggle. DashboardPage applies the filter client-side: if `hasLinkedJira`, exclude items with empty `jiraTickets` array. Filter is based on ticket presence only (not live status) — status-based filtering deferred to v2.

**Rationale**: Pre-filtering by ticket presence is instant (no API calls, data already in Google Sheets). Status-based filtering requires fetching all tickets upfront, conflicting with the lazy-load design. v1 shows items that have any tickets linked.

**Alternatives considered**:
- Pre-fetch all ticket statuses at load: Rate-limit risk; slow for large roadmaps; poor UX
- Server-side filter: Overengineered; filter state belongs with other client-side filters
