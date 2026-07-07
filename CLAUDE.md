# RoadMapContent — Agent Context

## Active Feature

<!-- SPECKIT START -->
**Feature**: Jira Ticket Linking + Whole-App Authentication
**Plan**: [specs/003-jira-ticket-linking/plan.md](specs/003-jira-ticket-linking/plan.md)
**Spec**: [specs/003-jira-ticket-linking/spec.md](specs/003-jira-ticket-linking/spec.md)
**Data Model**: [specs/003-jira-ticket-linking/data-model.md](specs/003-jira-ticket-linking/data-model.md)
**API Contracts**: [specs/003-jira-ticket-linking/contracts/api.md](specs/003-jira-ticket-linking/contracts/api.md)
**Quickstart**: [specs/003-jira-ticket-linking/quickstart.md](specs/003-jira-ticket-linking/quickstart.md)
<!-- SPECKIT END -->

## Project Summary

SNOMED International Roadmap CMS — single-file HTML app (`standalone.html`) that loads live data from a Google Sheet via the GViz public endpoint. No build step, no backend, no authentication. Deployed as a static file on GitHub Pages.

---

## standalone.html — Deployment Note

`standalone.html` lives in the **repo root** and is published to GitHub Pages at `{pages-url}/standalone.html`. The deploy workflow (`deploy.yml`) copies it into `frontend/dist/` after the Vite build before uploading the Pages artifact. It contains links to internal IHTSDO Jira tickets (snomed.atlassian.net) — external users can see the page but the Jira links will require Atlassian login.

---

## standalone.html Architecture

### Data flow
1. On load, `gviz(tab)` fetches each Google Sheet tab as JSON via:
   `https://docs.google.com/spreadsheets/d/{GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:json&sheet={tab}`
2. Four tabs are loaded in parallel: `ProvenanceEvents`, `RoadmapItems`, `MemberPriorities`, `JiraProjects`
3. `JiraProjects` rows are joined to `RoadmapItems` via the `associatedRoadmapItems` pipe-separated column (e.g. `1|3|7`) building a `jiraByItem` map keyed by roadmap item `id`

### Google Sheet tabs
| Tab | Key columns |
|-----|-------------|
| `RoadmapItems` | `id, title, siStatus, horizon, activityType, provenanceChips, deliveryPeriods, …` |
| `JiraProjects` | `ticketId, project, status, jiraTitle, associatedRoadmapItems` |
| `ProvenanceEvents` | `shortCode, displayLabel, eventType, eventDate` |
| `MemberPriorities` | `rank, topicTitle, responseCount, responsePercentage, …` |

**Sheet ID**: `1DG4tn6sR4u0vi-DLyix8B37mxlFFb2feuxgtpTTHrXo`

### Jira badge rendering (`jiraLink()`)
Each ticket displays as: `IHTSDO-1287 · Drug therapy ●`
- Ticket ID (fixed-width, bold, links to `snomed.atlassian.net/browse/{ticketId}`)
- Title truncated with ellipsis (`max-width:420px`)
- Coloured status dot (see `JIRA_STATUS_COLORS`)
- Tooltip shows full title + status

### Known Jira statuses (IHTSDO project)
`Accepted`, `In Construction`, `In Construction Review`, `In Fast Track`, `In Elaboration`, `In Inception`, `In Combined Inception & Elaboration`, `On Hold`, `Reopened`, `Closed` — all mapped in `JIRA_STATUS_COLORS`.

---

## Updating Jira Data in the Sheet

When new Jira projects are added or statuses/titles need refreshing:

1. **Fetch ticket data** using the Atlassian MCP (`mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql`):
   - Cloud ID: `7ec62332-642c-4a7d-bc6a-c075cb4756f3` (snomed.atlassian.net)
   - Query by specific keys: `key in (IHTSDO-123, IHTSDO-456, ...)` for targeted updates
   - Fields needed: `["summary", "status"]`
   - Results are large — save to file and extract with `jq -r '.issues.nodes[] | [.key, .fields.status.name, (.fields.summary // "")] | @tsv'`

2. **Build an Apps Script** with the fetched data embedded as a JS object (`{ticketId: {status, title}}`) and a `setValues()` batch write to the `JiraProjects` tab. Run via **Extensions → Apps Script** in the Sheet.

3. **Adding a new Jira project**: add rows to `JiraProjects` with the new project's `ticketId`, `project`, `status`, `jiraTitle`, and `associatedRoadmapItems`. The Jira filter dropdown in the app auto-populates from distinct `project` values — no code change needed unless the new project uses status names not yet in `JIRA_STATUS_COLORS` (line 43 of `standalone.html`).

4. **`standalone.html` changes only needed if**:
   - A new Jira status name appears that isn't in `JIRA_STATUS_COLORS`
   - The `JiraProjects` tab gains new columns that should be displayed
