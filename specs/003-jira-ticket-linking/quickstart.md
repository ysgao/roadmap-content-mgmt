# Quickstart: Jira Ticket Linking + Auth

**Date**: 2026-06-17 | **Extends**: `specs/001-roadmap-content-mgmt/quickstart.md`

## New Environment Variables

Add these to `backend/.env`:

```env
# Jira service account (obtain from SNOMED IT team)
JIRA_BASE_URL="https://ihtsdo.atlassian.net"
JIRA_EMAIL="roadmap-service@snomed.org"
JIRA_API_TOKEN="your-jira-api-token"

# Keycloak OIDC (obtain from SNOMED IT team)
OIDC_CLIENT_ID="roadmap-cms"
OIDC_CLIENT_SECRET="your-keycloak-client-secret"
OIDC_ISSUER_URL="https://keycloak.snomed.org/realms/snomed"
OIDC_CALLBACK_URL="http://localhost:3001/auth/callback"

# Disable mock auth for real auth testing
MOCK_AUTH="false"
```

## Dev Without Keycloak (Mock Auth)

Set `MOCK_AUTH=true` in `.env` to bypass Keycloak and auto-authenticate as a mock user. All endpoints accessible. Use this for local development.

## Dev With Real Keycloak

1. Obtain Keycloak client credentials from SNOMED IT team
2. Set `MOCK_AUTH=false` and fill OIDC vars in `.env`
3. Ensure `OIDC_CALLBACK_URL` matches exactly what's registered in Keycloak client config
4. Start backend: `cd backend && npm run dev`
5. Navigate to `http://localhost:5173` → redirected to Keycloak login

## Test Jira Proxy (dev)

With backend running and `MOCK_AUTH=true`:

```bash
curl "http://localhost:3001/api/v1/jira/tickets?keys=CRS-1234" \
  -H "Cookie: connect.sid=<your-session-cookie>"
```

Or with `MOCK_AUTH=true` the session is auto-set. Jira credentials must be valid regardless of `MOCK_AUTH`.

## Google Sheet Update

Add `jiraTickets` header to column 17 of the RoadmapItems tab:

Open Apps Script in the sheet and run:
```javascript
function addJiraTicketsColumn() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ri = ss.getSheetByName("RoadmapItems");
  ri.getRange(1, 17).setValue("jiraTickets");
  ri.getRange(1, 17).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff");
}
```

Then add ticket keys to specific rows, e.g. for Surgical Procedures (row 4):
```
CRS-1234|CRS-5678
```

## Render Deployment

1. Push to `main` on GitHub
2. Render auto-deploys via `render.yaml`
3. Set env vars in Render dashboard (Settings → Environment)
4. Set `NODE_ENV=production`, all Keycloak + Jira vars
5. Set `FRONTEND_URL` to your Render URL or custom domain
6. Update `OIDC_CALLBACK_URL` in both `.env` and Keycloak client config to the Render URL

## Key URLs (dev with MOCK_AUTH=true)

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Dashboard (auto-authenticated in dev) |
| `http://localhost:3001/api/v1/jira/tickets?keys=CRS-1` | Test Jira proxy |
| `http://localhost:3001/auth/me` | Verify session |
