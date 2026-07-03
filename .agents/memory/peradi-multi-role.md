---
name: PERADI multi-role admin system
description: Role-based admin system — 4 roles, bcrypt DB auth, seed from env vars, requireRole middleware
---

# Multi-Role Admin System — PERADI Portal

## The rule
Admin auth uses DB table `admin_users` + bcrypt (NOT env-var comparison). Session cookie stores `{userId, username, role}`. `ensureSeedAdmin()` seeds from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars on startup if table is empty.

**Roles:** `full_access | registrasi | keuangan | spectator`

**Why:** User explicitly requested role isolation — registrasi can only edit NIA, keuangan can only edit statusBayar, spectator is read-only, full_access owns all.

## How to apply
- All role checks use `requireRole(...roles)` after `requireAdmin` middleware
- `full_access` is NOT implicitly included — pass it explicitly in allowedRoles
- Admin cannot delete or demote themselves (guarded in routes/admin.ts)
- Tab "Kelola Admin" only visible in AdminPanel when `role === "full_access"`
- `lib/db/src/schema/adminUsers.ts` is source of truth for table schema

## Key files
- `artifacts/api-server/src/lib/adminAuth.ts` — all auth logic
- `artifacts/api-server/src/routes/admin.ts` — CRUD endpoints for admin users
- `artifacts/peradi-portal/src/AdminPanel.tsx` — frontend with role-aware UI
- `lib/db/src/schema/adminUsers.ts` — DB schema
