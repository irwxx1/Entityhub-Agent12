---
name: PERADI security fixes
description: Object storage private-file endpoint auth and DB route error handling for the PERADI portal
---

# Security Fixes — PERADI Portal

## Private file endpoint must require admin auth
`GET /api/storage/objects/:path` serves private files (selfie photos, transfer proof, KTA photos) proxied from object storage rather than served directly from GCS. This route MUST be protected by `requireAdmin` middleware — it was previously accessible without login, exposing sensitive personal/financial documents.

**Why:** the objects behind this route are personal identity and financial documents (advocate KTA, bank transfer proof) — unauthenticated access is a real privacy/security leak, not just a hardening nitpick.

**How to apply:** any new route that serves or proxies private object storage content must go through `requireAdmin` (or a role-scoped variant) — never serve private-bucket paths unauthenticated.

## DB routes need explicit error handling
Route handlers in `peserta.ts` and `admin.ts` (and any new DB-backed route) must wrap DB calls with try/catch or an error-handling middleware — unhandled promise rejections from DB errors previously could crash the whole server process.

**Why:** Express 5 handles rejected async handlers better than Express 4, but letting a DB error surface unhandled still risks taking down the process for all users, not just the failing request.

**How to apply:** New route handlers touching `@workspace/db` must catch errors and respond with a proper HTTP error status instead of throwing.
