---
name: PERADI portal architecture
description: Monorepo structure, key libs, env vars, and permanent constraints for PERADI MUSCAB portal
---

# PERADI Portal Architecture

## Stack
- Frontend: `artifacts/peradi-portal` (React+Vite, path `/`)
- Backend: `artifacts/api-server` (Express 5, path `/api`)
- DB: PostgreSQL + Drizzle ORM; tables: `peserta_muscab`, `admin_users`
- Object storage: Replit Object Storage (GCS sidecar at `http://127.0.0.1:1106`) via Uppy
- Auth: bcrypt DB-based admin auth (NOT passport/JWT); signed cookies via SESSION_SECRET

## Permanent constraints
- Footer "Dikembangkan oleh Irwan, S.H. berkolaborasi dengan Replit © 2026" — NEVER remove or change
- `lib/object-storage-web` MUST be in root `tsconfig.json` references (TS6305 if missing)
- Use Reserved VM deployment, NOT Autoscale (cold start timeout with Autoscale)
- After changing `lib/api-spec/openapi.yaml`, MUST run: `pnpm --filter @workspace/api-spec run codegen`
- After changing DB schema, MUST run: `pnpm --filter @workspace/db run push`

## Env vars (all set in Replit Secrets — do not ask user again)
- `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`

## Navigation
- URL routing via `useUrlTab()` hook (pushState) in App.tsx
- `/admin` handled in `main.tsx` → mounts AdminPanel
- Deep links work: `/daftar`, `/pengumuman`, `/agenda`, `/tata-tertib`, `/dokumen`, `/lpj`, `/kuorum`, `/hasil`

## peserta_muscab table columns (as of last DB push)
- id, nama, nia, alamat, hp, email
- statusNia (pending/aktif/tidak_aktif), statusBayar (menunggu/terverifikasi/ditolak)
- hadir (boolean, default false) — for hari-H check-in
- selfiePath, buktiPath, fotoKtaPath, catatanAdmin, createdAt, updatedAt

## Rekapan Live page (/hasil)
- Vote counts are STATIC MOCK DATA in App.tsx (KETUA: [72,48], SEKJEND: [65,55])
- Candidates: KETUA=[Irwan S.H., Fauzan Hakim S.H.M.H.], SEKJEND=[Rizky Pratama S.H., Dewi Sartika Lubis S.H.M.H.]
- parseSheetCSV function was removed — Google Sheets integration no longer exists
- Pending: real-time vote input from admin panel (not yet built)

## Admin roles
- full_access / registrasi / keuangan / spectator
- ensureSeedAdmin() seeds from ADMIN_USERNAME/ADMIN_PASSWORD env vars on startup if table empty
- requireRole(...roles) middleware — full_access NOT implicitly included, pass it explicitly
