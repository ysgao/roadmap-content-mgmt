# Tasks: Jira Ticket Linking + Optional Authentication

**Input**: Design documents from `specs/003-jira-ticket-linking/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US0–US3 matching spec.md)

## Path Conventions

- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Config/deploy: repository root

---

## Phase 1: Setup

**Purpose**: Prepare environment for new backend service and Google Sheet column.

- [ ] T001 Add `jiraTickets` column header to RoadmapItems tab in Google Sheet (run `addJiraTicketsColumn` Apps Script from `scripts/setup-sheet.gs`)
- [ ] T002 Add Jira and Keycloak env vars to `backend/.env`: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL`, `OIDC_CALLBACK_URL`
- [ ] T003 [P] Add `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` to `backend/.env.example`
- [ ] T004 [P] Add `JiraTicket` interface and `jiraTickets: string[]` field to `RoadmapItem` in `frontend/src/types.ts`
- [ ] T005 [P] Add `jiraTickets` parsing (split on `|`) to `fetchRoadmapItems()` in `frontend/src/services/sheets.ts` (column 17)

**Checkpoint**: Google Sheet has `jiraTickets` column; TypeScript types updated; env vars defined.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend Jira proxy service and Keycloak auth — required before US0 and US1.

**⚠️ CRITICAL**: US0 and US1 cannot be implemented until this phase is complete.

- [ ] T006 Implement `jiraService.ts`: `fetchJiraTickets(keys: string[]): Promise<JiraTicket[]>` — calls Atlassian REST API v3 `GET /rest/api/3/issue/{key}?fields=summary,status,assignee,priority` with Basic auth (`JIRA_EMAIL:JIRA_API_TOKEN`), 5s timeout, per-key error handling in `backend/src/services/jiraService.ts`
- [ ] T007 Implement `GET /api/v1/jira/tickets` route: parse `keys` query param (comma-separated, max 10), call `jiraService.fetchJiraTickets()`, require Keycloak session via `requireAuth` middleware in `backend/src/api/routes/jira.ts`
- [ ] T008 Mount Jira router at `/api/v1/jira` in `backend/src/api/routes/index.ts`
- [ ] T009 Update `GET /auth/me` in `backend/src/api/routes/auth.ts` to return `{"user": null}` (HTTP 200) instead of 401 when unauthenticated — frontend needs safe session check
- [ ] T010 [P] Update `FRONTEND_URL` CORS config in `backend/src/index.ts` to accept both `http://localhost:5173` (dev) and `https://ysgao.github.io` (prod) — use array or regex origin
- [ ] T011 [P] Add `getJiraTickets(keys: string[]): Promise<JiraTicketsResponse>` to `frontend/src/services/api.ts` — calls `GET /api/v1/jira/tickets?keys=...` with `credentials: 'include'`
- [ ] T012 [P] Update `useAuth` hook in `frontend/src/services/auth.ts` to call `GET /auth/me`, return `{user: null, isAuthenticated: false}` on 200-with-null rather than treating it as an error

**Checkpoint**: Backend starts, `GET /api/v1/jira/tickets` returns 401 for unauthenticated requests and 200 with ticket data for authenticated requests. Frontend auth service correctly distinguishes null session from network error.

---

## Phase 3: User Story 0 — Optional Sign-In for Jira Panel (Priority: P1)

**Goal**: Any visitor sees the full public dashboard. Cards with linked Jira tickets show "Sign in to view Jira details" for unauthenticated users. SNOMED staff click the button, authenticate via Keycloak, and return to see live ticket data.

**Independent Test**: Open dashboard without login → full roadmap visible, no auth prompt. Expand a card with `jiraTickets` values → "Sign in" prompt shown. Click sign-in → Keycloak login → return to dashboard → Jira tickets visible on that card.

### Implementation for User Story 0

- [ ] T013 [US0] Update `frontend/src/services/auth.ts` `login()` function to store current URL in `sessionStorage` before redirecting to `/auth/login`, so return URL is preserved after Keycloak callback
- [ ] T014 [US0] Update `GET /auth/callback` handler in `backend/src/api/routes/auth.ts` to redirect to stored return URL (passed via `state` param in OIDC flow) after successful login
- [ ] T015 [US0] Create `JiraSignInPrompt` component: shows lock icon + "Sign in with SNOMED account to view Jira details" button, calls `auth.login()` on click in `frontend/src/components/dashboard/JiraSignInPrompt.tsx`
- [ ] T016 [US0] Set `MOCK_AUTH=false` guard: ensure `requireAuth` middleware in `backend/src/api/middleware/auth.ts` only allows mock bypass when `NODE_ENV=development` AND `MOCK_AUTH=true`

**Checkpoint**: Auth flow works end-to-end in dev with `MOCK_AUTH=false`. Sign-in redirects to Keycloak; callback restores correct page. `JiraSignInPrompt` renders correctly.

---

## Phase 4: User Story 1 — View Linked Jira Tickets on Card (Priority: P1)

**Goal**: Authenticated users expand a roadmap card with linked tickets and see live Jira data: key, summary, status, assignee, priority, and a link to Jira.

**Independent Test**: Add `CRS-1234` to a row in the Google Sheet `jiraTickets` column. Log in. Expand that card → Jira panel appears with live ticket data. Verify status matches current Jira state.

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create `JiraTicketRow` component: displays one `JiraTicket` — key (linked), summary, status badge, assignee, priority in `frontend/src/components/dashboard/JiraTicketRow.tsx`
- [ ] T018 [US1] Create `JiraTickets` component: receives `jiraTickets: string[]` and `isAuthenticated: boolean`; if not authenticated → renders `JiraSignInPrompt`; if authenticated → on mount calls `getJiraTickets(keys)`, shows loading then renders `JiraTicketRow` per result; handles per-ticket errors gracefully in `frontend/src/components/dashboard/JiraTickets.tsx`
- [ ] T019 [US1] Add `JiraTickets` section to `RoadmapCard` component in `frontend/src/components/dashboard/RoadmapCard.tsx`: render below expanded card content only when `item.jiraTickets.length > 0`; pass `isAuthenticated` from `useAuth()`
- [ ] T020 [US1] Update `DashboardPage` to call `useAuth()` and pass `isAuthenticated` down through `HorizonGroup` → `RoadmapCard` → `JiraTickets` in `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Authenticated user expands a card with linked tickets → live Jira data visible. Unauthenticated user sees sign-in prompt. Cards without tickets unchanged.

---

## Phase 5: User Story 2 — Link Tickets via Google Sheet (Priority: P1)

**Goal**: Content admin adds ticket keys to the `jiraTickets` column in the sheet. On next dashboard load, those tickets appear on the corresponding card.

**Independent Test**: Add `CRS-TEST|CRS-OTHER` to the Substances row in the sheet. Reload dashboard. Expand Substances card while authenticated → two Jira tickets displayed.

### Implementation for User Story 2

- [ ] T021 [US2] Add `addJiraTicketsColumn` function to `scripts/setup-sheet.gs` that adds `jiraTickets` header at column 17 of RoadmapItems tab with matching header styling
- [ ] T022 [US2] Verify `sheets.ts` parser correctly handles: empty `jiraTickets` cell → `[]`, single key → `["CRS-1234"]`, multiple keys → `["CRS-1234","SCTMD-5678"]` in `frontend/src/services/sheets.ts`
- [ ] T023 [US2] Update static fallback `frontend/public/data/roadmap-items.json` to add `"jiraTickets": []` to every item (maintains compatibility with no-Sheets dev mode)

**Checkpoint**: Sheet edit → dashboard reload → ticket keys parsed correctly from sheet column 17. Static JSON fallback includes `jiraTickets` field.

---

## Phase 6: User Story 3 — Filter by Linked Jira Tickets (Priority: P2)

**Goal**: User enables "Has linked Jira tickets" filter. Dashboard shows only roadmap items that have at least one ticket key in their `jiraTickets` field.

**Independent Test**: Enable filter → only items with non-empty `jiraTickets` array visible; horizon counts update. Disable filter → all items visible.

### Implementation for User Story 3

- [ ] T024 [US3] Add `hasLinkedJira: boolean` and `setHasLinkedJira: (v: boolean) => void` to Zustand store in `frontend/src/store/filterStore.ts`
- [ ] T025 [P] [US3] Add "Has Jira tickets" toggle to `FilterBar` component in `frontend/src/components/dashboard/FilterBar.tsx`
- [ ] T026 [US3] Update `DashboardPage` client-side filter logic to exclude items with empty `jiraTickets` array when `hasLinkedJira` is true in `frontend/src/pages/DashboardPage.tsx`

**Checkpoint**: Filter toggle shows/hides items correctly based on `jiraTickets` presence. Counts per horizon update. Reset clears filter.

---

## Phase 7: Deployment — Render Backend

**Purpose**: Deploy the Jira proxy backend to Render so the GitHub Pages SPA can call it in production.

- [ ] T027 Create `render.yaml` at repo root defining a Node.js web service: `buildCommand: "cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build"`, `startCommand: "node backend/dist/index.js"`, env vars: `NODE_ENV=production`, `FRONTEND_URL=https://ysgao.github.io`, `MOCK_AUTH=false`
- [ ] T028 Update `backend/src/index.ts` production static serving to handle split deployment: in `NODE_ENV=production`, if `frontend/dist` does not exist (Render-only backend), skip static serving — backend serves only API routes
- [ ] T029 [P] Update `frontend/src/services/api.ts` to use `VITE_API_BASE_URL` env var for the Jira proxy base URL (defaults to empty string for dev proxy): `const JIRA_API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''`
- [ ] T030 [P] Add `VITE_API_BASE_URL` to `frontend/.env.example` and `deploy.yml` GitHub Actions env section (value: Render backend URL)
- [ ] T031 [P] Add `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL`, `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` to `backend/.env.example` (update existing placeholder values)

**Checkpoint**: `render.yaml` committed. Render deployment configured. Frontend calls correct backend URL in production build.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Add Jira ticket count badge to `RoadmapCard` collapsed header (show count of linked tickets) in `frontend/src/components/dashboard/RoadmapCard.tsx`
- [ ] T033 [P] Add rate-limit protection to `GET /api/v1/jira/tickets` (max 30 req/min per session) in `backend/src/api/middleware/rateLimiter.ts`
- [ ] T034 [P] Handle Jira unavailability gracefully: if `JIRA_BASE_URL` not configured, `jiraService.ts` returns `{key, error: "Jira not configured"}` for all keys
- [ ] T035 Commit all changes and push to `main` — triggers GitHub Actions redeploy of GitHub Pages frontend; manually trigger Render redeploy of backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS US0 and US1**
- **Phase 3 (US0 Auth)**: Depends on Phase 2
- **Phase 4 (US1 View Tickets)**: Depends on Phase 2 + Phase 3 (`JiraSignInPrompt` needed)
- **Phase 5 (US2 Sheet Linking)**: Depends on Phase 1 only — independent of auth
- **Phase 6 (US3 Filter)**: Depends on Phase 1; independent of auth/Jira fetch
- **Phase 7 (Deployment)**: Depends on Phases 3–4 complete
- **Phase 8 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US0**: After Foundational — auth flow
- **US1**: After Foundational + US0 (needs `JiraSignInPrompt`)
- **US2**: After Phase 1 only — sheet column + parser
- **US3**: After Phase 1 only — filter is client-side, no auth needed

### Within Each Story

- Backend service → route → frontend service wrapper → UI component → page integration

---

## Parallel Opportunities

### Phase 1 Parallel Batch
```
T003  Update .env.example
T004  Add JiraTicket type to types.ts
T005  Update sheets.ts parser
```

### Phase 2 Parallel Batch (after T006 jiraService done)
```
T010  Update CORS config in index.ts
T011  Add getJiraTickets() to api.ts
T012  Update useAuth hook in auth.ts
```

### Phase 4 Parallel Batch
```
T017  Create JiraTicketRow component
```
Then: T018 (JiraTickets) → T019 (RoadmapCard) → T020 (DashboardPage)

---

## Implementation Strategy

### MVP (US0 + US1 — sign-in + view tickets)

1. Phase 1 (Setup)
2. Phase 2 (Foundational — Jira service + auth)
3. Phase 3 (US0 — sign-in flow)
4. Phase 4 (US1 — view tickets on card)
5. **STOP AND VALIDATE**: Sign in → expand card → Jira data visible
6. Phase 7 (Deploy to Render)

### Incremental Delivery

1. Setup + Foundational → Jira proxy working locally
2. US0 + US1 → core Jira viewing experience (MVP)
3. US2 → sheet-based ticket linking confirmed end-to-end
4. US3 → filter added
5. Polish → badge, rate-limit, error handling

---

## Notes

- `[P]` = safe to parallelize (different files, no incomplete dependencies)
- `[USN]` = maps task to user story for traceability
- `MOCK_AUTH=true` in dev allows testing Jira endpoints without real Keycloak
- Jira API token must be a personal API token from `id.atlassian.com/manage-profile/security/api-tokens`
- Service account email + token must have read access to the relevant Jira projects (CRS, SCTMD, etc.)
- `GET /auth/me` returning `{"user": null}` on 200 is critical — frontend distinguishes "not logged in" from "server error"
