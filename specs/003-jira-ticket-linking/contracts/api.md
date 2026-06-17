# API Contracts: Jira Ticket Linking

**Date**: 2026-06-17 | **Base URL**: `/api/v1`

**Auth scope**: Only the Jira proxy endpoint requires a Keycloak session. All existing public GET endpoints remain unauthenticated. The SPA (GitHub Pages) is public and unchanged.

---

## Auth Scope (Unchanged for Existing Endpoints)

| Endpoint group | Auth required |
|---------------|---------------|
| `GET /api/v1/roadmap-items` | No (public) |
| `GET /api/v1/timeline` | No (public) |
| `GET /api/v1/member-priorities` | No (public) |
| `GET /api/v1/provenance-events` | No (public) |
| `GET /api/v1/evidence` | No (public) |
| `POST/PUT/DELETE /api/v1/*` | Yes (admin session) |
| **`GET /api/v1/jira/tickets`** | **Yes (Keycloak session)** |
| `GET /auth/login` | No (initiates auth) |
| `GET /auth/callback` | No (OIDC callback) |
| `POST /auth/logout` | Yes (session required) |
| `GET /auth/me` | No (returns null if unauthenticated) |

---

## New Endpoint: Jira Ticket Proxy

### `GET /api/v1/jira/tickets`

Fetches live details for one or more Jira ticket keys from the SNOMED International Jira instance.

**Auth**: Required (Keycloak session)

**Query params**:
- `keys` — comma-separated Jira ticket keys, e.g. `CRS-1234,SCTMD-5678` (required, max 10 per request)

**Response** `200 OK`:
```json
{
  "tickets": [
    {
      "key": "CRS-1234",
      "summary": "Add laboratory observations content for IVD regulation",
      "status": "In Progress",
      "assignee": "Jane Smith",
      "priority": "High",
      "url": "https://ihtsdo.atlassian.net/browse/CRS-1234"
    },
    {
      "key": "SCTMD-5678",
      "summary": "Review surgical procedures hierarchy gaps",
      "status": "Open",
      "assignee": null,
      "priority": "Medium",
      "url": "https://ihtsdo.atlassian.net/browse/SCTMD-5678"
    }
  ]
}
```

**Response with errors** (partial failure — some keys valid, some not):
```json
{
  "tickets": [
    {
      "key": "CRS-1234",
      "summary": "Add laboratory observations content",
      "status": "In Progress",
      "assignee": "Jane Smith",
      "priority": "High",
      "url": "https://ihtsdo.atlassian.net/browse/CRS-1234"
    },
    {
      "key": "CRS-INVALID",
      "summary": "",
      "status": "",
      "assignee": null,
      "priority": null,
      "url": "https://ihtsdo.atlassian.net/browse/CRS-INVALID",
      "error": "Not found"
    }
  ]
}
```

**Errors**:
- `400 { "error": "keys parameter required" }` — missing keys param
- `400 { "error": "Maximum 10 keys per request" }` — too many keys
- `401 { "error": "Unauthorized" }` — no session
- `503 { "error": "Jira unavailable" }` — JIRA_BASE_URL not configured or Jira unreachable

**Per-ticket error values** (in `error` field of individual ticket object):
- `"Not found"` — Jira returns 404 for this key
- `"Access restricted"` — Jira returns 403
- `"Unavailable"` — Jira request timed out (5s timeout)

---

## Unchanged Endpoints

All existing endpoints (`GET /roadmap-items`, `GET /timeline`, `GET /member-priorities`, `GET /provenance-events`, `GET /evidence`) remain functionally identical and public — no auth changes.

`GET /auth/me` returns `{"user": null}` (not 401) when unauthenticated, so the frontend can check session state without triggering an error.

---

## New Required Environment Variables (Backend)

| Variable | Description | Example |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Atlassian Cloud base URL | `https://ihtsdo.atlassian.net` |
| `JIRA_EMAIL` | Service account email | `roadmap-service@snomed.org` |
| `JIRA_API_TOKEN` | Jira API token for service account | (from Atlassian API tokens page) |

Existing Keycloak vars (`OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL`, `OIDC_CALLBACK_URL`) were already defined and are now active (not bypassed by `MOCK_AUTH` in production).
