# Quickstart: Roadmap Content Management Application

**Date**: 2026-06-17

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or Docker)
- An OIDC-compliant identity provider (or use local dev mock)

## Repository Layout

```
RoadMapContent/
├── backend/          # Express API + Prisma
├── frontend/         # React SPA (Vite)
└── specs/            # Feature specs (this directory)
```

## 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, SESSION_SECRET, OIDC_* variables
npm install
npx prisma migrate dev --name init
npm run dev           # starts on http://localhost:3001
```

### Required `.env` variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/roadmap"
SESSION_SECRET="change-me-in-production"
OIDC_CLIENT_ID="your-client-id"
OIDC_CLIENT_SECRET="your-client-secret"
OIDC_ISSUER_URL="https://your-idp.example.com"
OIDC_CALLBACK_URL="http://localhost:3001/auth/callback"
FRONTEND_URL="http://localhost:5173"
```

### Dev without OIDC (local mock)

Set `MOCK_AUTH=true` in `.env` to bypass OIDC and auto-authenticate as an admin. Only works in `NODE_ENV=development`.

## 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001
npm install
npm run dev           # starts on http://localhost:5173
```

## 3. Seed Data

```bash
cd backend
npm run seed          # loads reference roadmap data from seeds/
```

## 4. Run Tests

```bash
# Backend unit + integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E (requires both servers running)
cd frontend && npx playwright test
```

## 5. Build for Production

```bash
cd frontend && npm run build    # outputs to frontend/dist/
cd backend && npm run build     # outputs to backend/dist/
```

The backend serves `frontend/dist/` as static assets in production.

## 6. Key URLs (dev)

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Dashboard (public read) |
| `http://localhost:5173/admin` | Admin interface (requires login) |
| `http://localhost:5173/timeline` | Gantt timeline view |
| `http://localhost:3001/api/v1` | REST API base |
| `http://localhost:3001/auth/login` | OIDC login redirect |
