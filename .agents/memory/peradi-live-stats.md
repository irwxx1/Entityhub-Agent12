---
name: PERADI live stats and hadir feature
description: Live stat boxes on Beranda and Tandai Hadir (check-in) feature in admin panel
---

# Live Stats & Tandai Hadir

## GET /api/stats endpoint
- Route: `artifacts/api-server/src/routes/peserta.ts`
- Returns: `{ calon: number, peserta: number }`
  - `calon` = total rows in `peserta_muscab`
  - `peserta` = rows where `statusBayar = 'terverifikasi'` (NOT 'lunas' — that value doesn't exist in schema)
- No auth required (public endpoint)

## Beranda live stat boxes
- 3 boxes: static "900++ Anggota", live "Calon Peserta" (navy dot), live "Peserta MUSCAB" (green dot)
- `useLiveStats` hook in App.tsx polls `/api/stats` every 30s
- CSS classes: `.stat-live`, `.stat-live-green`, `.stat-live-dot`, `.stat-live-label`

## hadir field
- Added `hadir: boolean("hadir").notNull().default(false)` to `pesertaMuscabTable` schema
- Omitted from `insertPesertaSchema` (public form cannot set it)
- Added to OpenAPI Peserta schema (required) and PesertaUpdate (optional)
- Codegen run after spec update

## TandaiHadir component (AdminPanel.tsx)
- Visible to: `full_access` and `registrasi` roles only
- Tab: "Tandai Hadir" with `ti-qrcode` icon
- Features: search by nama/NIA, 3 counter boxes (Sudah Hadir/Belum Hadir/Total), toggle per row
- Toggle calls `useUpdateAdminPeserta` with `{ hadir: !p.hadir }`
- Row turns green when hadir=true
- Shows statusBayar badge per peserta so panitia can see payment status

**Why:** registrasi role panitia needs a fast check-in UI on hari-H without full admin access.
**How to apply:** Any new check-in-related UI should reuse TandaiHadir component patterns; hadir field is the source of truth for attendance.
