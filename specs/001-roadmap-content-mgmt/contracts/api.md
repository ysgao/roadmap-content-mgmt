# API Contracts: Roadmap Content Management Application

**Date**: 2026-06-17 | **Base URL**: `/api/v1`

**Auth**: All `GET` endpoints are public (no auth required). All `POST`, `PUT`, `PATCH`, `DELETE` endpoints require a valid admin session cookie (`Authorization: Bearer <token>` or session cookie from OAuth2 login flow). Unauthenticated write requests return `401 Unauthorized`.

---

## Auth Endpoints

### `GET /auth/login`
Redirects to org OIDC provider. No request body.

**Response**: `302 Redirect` → OIDC authorization URL

---

### `GET /auth/callback`
OIDC callback handler. Sets session cookie.

**Response**: `302 Redirect` → `/` (dashboard) on success, `/login?error=auth_failed` on failure

---

### `POST /auth/logout`
Destroys session.

**Response**:
```json
{ "message": "Logged out" }
```

---

### `GET /auth/me`
Returns current session user info.

**Response** (authenticated):
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "isAdmin": true
}
```

**Response** (unauthenticated): `401`

---

## Roadmap Items

### `GET /roadmap-items`
Returns all roadmap items grouped by horizon. Supports filtering.

**Query params**:
- `origin` — ProvenanceEvent shortCode (e.g. `Seoul24`); filters items linked to this event
- `siStatus` — enum value (Active / Planned / Paused / Deferred)
- `activityType` — enum value
- `horizon` — enum value

**Response**:
```json
{
  "horizons": {
    "Now": [ /* RoadmapItemSummary[] */ ],
    "Next": [ /* RoadmapItemSummary[] */ ],
    "Later": [ /* RoadmapItemSummary[] */ ],
    "UnderAssessment": [ /* RoadmapItemSummary[] */ ],
    "InMaintenance": [ /* RoadmapItemSummary[] */ ]
  },
  "counts": {
    "Now": 12,
    "Next": 3,
    "Later": 1,
    "UnderAssessment": 9,
    "InMaintenance": 6
  },
  "total": 31
}
```

**RoadmapItemSummary**:
```json
{
  "id": "uuid",
  "title": "string",
  "askDescription": "string",
  "siStatus": "Active",
  "impactRating": "High",
  "horizon": "Now",
  "activityType": "MemberDriven",
  "timelineClassification": "Project",
  "trigger": "string | null",
  "progressNarrative": "string | null",
  "addressedStatus": "Partially | null",
  "nextMilestoneDate": "2026-09-01 | null",
  "implementationNotes": "string | null",
  "displayOrder": 0,
  "provenanceChips": [
    { "shortCode": "Seoul24", "displayLabel": "Seoul '24", "referenceNumber": 3 }
  ],
  "deliveryPeriods": [
    { "periodLabel": "H1 2026", "periodYear": 2026, "periodHalf": "H1", "barStyle": "Active" }
  ]
}
```

---

### `GET /roadmap-items/:id`
Returns full detail for one roadmap item.

**Response**: `RoadmapItemSummary` (same structure as above)

**Error**: `404 { "error": "Not found" }` if ID does not exist

---

### `POST /roadmap-items` *(admin only)*
Creates a new roadmap item.

**Request body**:
```json
{
  "title": "string (required)",
  "askDescription": "string (required)",
  "siStatus": "Active | Planned | Paused | Deferred (required)",
  "impactRating": "High | Medium | Low (required when siStatus=Active)",
  "horizon": "Now | Next | Later | UnderAssessment | InMaintenance (required)",
  "activityType": "MemberDriven | Collaboration | CRG | Authoring | QAProgramme | Maintenance (required)",
  "timelineClassification": "Project | Continuous (required)",
  "trigger": "string | null",
  "progressNarrative": "string | null",
  "addressedStatus": "Yes | Partially | No | null",
  "nextMilestoneDate": "YYYY-MM-DD | null",
  "implementationNotes": "string | null",
  "displayOrder": 0,
  "provenanceLinks": [
    { "provenanceEventId": "uuid", "referenceNumber": 3 }
  ],
  "deliveryPeriods": [
    { "periodYear": 2026, "periodHalf": "H1", "barStyle": "Active" }
  ]
}
```

**Response**: `201 Created` with created `RoadmapItemSummary`

**Errors**:
- `400 { "error": "Validation failed", "fields": { "title": "required" } }` — missing required fields
- `401` — not authenticated

---

### `PUT /roadmap-items/:id` *(admin only)*
Replaces all fields of an existing roadmap item. Same body shape as `POST`.

**Response**: `200 OK` with updated `RoadmapItemSummary`

**Errors**: `400`, `401`, `404`

---

### `DELETE /roadmap-items/:id` *(admin only)*
Deletes a roadmap item and its associated delivery periods and provenance links.

**Response**: `204 No Content`

**Errors**: `401`, `404`

---

## Timeline

### `GET /timeline`
Returns all items with delivery periods for Gantt rendering.

**Response**:
```json
{
  "periods": ["H1 2026", "H2 2026", "H1 2027", "H2 2027", "H1 2028", "H2 2028", "2029+"],
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "horizon": "Now",
      "siStatus": "Active",
      "activityType": "MemberDriven",
      "deliveryPeriods": [
        { "periodLabel": "H1 2026", "barStyle": "Active" },
        { "periodLabel": "H2 2026", "barStyle": "Active" }
      ]
    }
  ]
}
```

---

## Member Priorities

### `GET /member-priorities`
Returns all member priorities in rank order.

**Response**:
```json
[
  {
    "id": "uuid",
    "rank": 1,
    "topicTitle": "Laboratory",
    "responseCount": 14,
    "responsePercentage": 60.87,
    "currentSIActivity": "string | null",
    "progressSummary": "string | null",
    "nextMilestones": "string | null",
    "riskFactors": "string | null",
    "provenanceEvents": [
      { "shortCode": "Seoul24", "displayLabel": "Seoul '24" }
    ]
  }
]
```

---

### `POST /member-priorities` *(admin only)*
Creates a member priority entry.

**Request body**:
```json
{
  "rank": 1,
  "topicTitle": "string (required)",
  "responseCount": 14,
  "responsePercentage": 60.87,
  "currentSIActivity": "string | null",
  "progressSummary": "string | null",
  "nextMilestones": "string | null",
  "riskFactors": "string | null",
  "provenanceEventIds": ["uuid"]
}
```

**Response**: `201 Created` with full priority object

---

### `PUT /member-priorities/:id` *(admin only)*
Replaces a member priority entry.

**Response**: `200 OK` with updated priority object

---

### `DELETE /member-priorities/:id` *(admin only)*
Deletes a member priority.

**Response**: `204 No Content`

---

## Provenance Events

### `GET /provenance-events`
Returns all provenance events (for filter dropdowns and chip selections).

**Response**:
```json
[
  {
    "id": "uuid",
    "shortCode": "Seoul24",
    "displayLabel": "Seoul '24",
    "eventType": "Survey",
    "eventDate": "2024-10-01",
    "participantCount": 23
  }
]
```

---

### `POST /provenance-events` *(admin only)*
Creates a provenance event.

**Request body**:
```json
{
  "shortCode": "string (required, unique)",
  "displayLabel": "string (required)",
  "eventType": "Survey | Workshop | Forum (required)",
  "eventDate": "YYYY-MM-DD (required)",
  "participantCount": 23
}
```

**Response**: `201 Created`

---

### `PUT /provenance-events/:id` *(admin only)*
Updates a provenance event.

**Response**: `200 OK`

---

## Evidence Inputs

### `GET /evidence`
Returns all evidence inputs with their linked provenance event details.

**Response**:
```json
[
  {
    "id": "uuid",
    "provenanceEvent": {
      "shortCode": "Seoul24",
      "displayLabel": "Seoul '24",
      "eventType": "Survey",
      "eventDate": "2024-10-01",
      "participantCount": 23
    },
    "summary": "string",
    "rankedGaps": [{ "rank": 1, "area": "Laboratory" }],
    "themes": ["Theme A"],
    "priorityShifts": [{ "area": "Substances", "fromRank": 1, "toRank": 2 }],
    "groupCount": null
  }
]
```

---

### `POST /evidence` *(admin only)*
Creates an evidence input for a provenance event.

**Request body**:
```json
{
  "provenanceEventId": "uuid (required)",
  "summary": "string (required)",
  "rankedGaps": [{ "rank": 1, "area": "Laboratory" }],
  "themes": ["Theme A"],
  "priorityShifts": [{ "area": "Substances", "fromRank": 1, "toRank": 2 }],
  "groupCount": 9
}
```

**Response**: `201 Created`

**Error**: `409 Conflict` if evidence already exists for this provenanceEventId

---

### `PUT /evidence/:id` *(admin only)*
Updates an evidence input.

**Response**: `200 OK`

---

## Common Error Responses

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": "Validation failed", "fields": {} }` | Missing/invalid request fields |
| 401 | `{ "error": "Unauthorized" }` | Write endpoint called without admin session |
| 404 | `{ "error": "Not found" }` | Resource ID does not exist |
| 409 | `{ "error": "Conflict", "detail": "..." }` | Duplicate unique constraint |
| 500 | `{ "error": "Internal server error" }` | Unexpected server error |
