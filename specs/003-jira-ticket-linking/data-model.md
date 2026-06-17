# Data Model: Jira Ticket Linking

**Date**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

## Changes to Existing Types

### RoadmapItem (extended)

Add `jiraTickets` field to the existing `RoadmapItem` TypeScript interface in `frontend/src/types.ts`:

```typescript
interface RoadmapItem {
  // ... all existing fields unchanged ...
  jiraTickets: string[]   // parsed from pipe-separated sheet column; empty array = no tickets
}
```

The `sheets.ts` parser reads column 17 (`jiraTickets`) and splits on `|`:
```typescript
jiraTickets: (r['jiraTickets'] ?? '').split('|').map(s => s.trim()).filter(Boolean)
```

The static JSON fallback in `frontend/public/data/roadmap-items.json` gains a `"jiraTickets": []` field on each item.

---

## New Types

### JiraTicket

Live data returned by `GET /api/v1/jira/tickets`. Not persisted anywhere.

```typescript
interface JiraTicket {
  key: string                  // e.g. "CRS-1234"
  summary: string
  status: string               // e.g. "In Progress", "Open", "Done"
  assignee: string | null      // display name, null if unassigned
  priority: string | null      // e.g. "High", "Medium"
  url: string                  // direct link: {JIRA_BASE_URL}/browse/{key}
  error?: string               // present when ticket could not be fetched
}
```

### JiraTicketsResponse

Response envelope from `GET /api/v1/jira/tickets`:

```typescript
interface JiraTicketsResponse {
  tickets: JiraTicket[]
}
```

---

## Filter Store Extension

Add to Zustand `filterStore.ts`:

```typescript
interface FilterState {
  // ... existing fields: origin, siStatus, activityType ...
  hasActiveJira: boolean
  setHasActiveJira: (v: boolean) => void
}
```

---

## Google Sheet Schema Change

### RoadmapItems tab — column 17 added

| Column | Field | Format |
|--------|-------|--------|
| 1 | id | string |
| 2 | title | string |
| 3–16 | (existing columns unchanged) | — |
| **17** | **jiraTickets** | **pipe-separated ticket keys, e.g. `CRS-1234\|SCTMD-5678`** |

Empty value = no linked tickets. Multiple tickets: `CRS-1234|CRS-5678|SCTMD-9012`.

---

## Backend New Types

In `backend/src/services/jiraService.ts`:

```typescript
interface JiraIssueApiResponse {
  key: string
  fields: {
    summary: string
    status: { name: string }
    assignee: { displayName: string } | null
    priority: { name: string } | null
  }
}

interface JiraTicketResult {
  key: string
  summary: string
  status: string
  assignee: string | null
  priority: string | null
  url: string
  error?: string
}
```
