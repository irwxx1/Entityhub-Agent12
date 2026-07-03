# Portal MUSCAB II DPC PERADI SAI Medan

Portal pendaftaran dan manajemen peserta Musyawarah Cabang (MUSCAB) II DPC PERADI SAI Medan, dibangun sebagai bagian dari ekosistem Entity Hub Networking.

## Run & Operate

- `pnpm --filter @workspace/peradi-portal run dev` — frontend portal (port 21575)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks dan Zod schemas dari OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — untuk signing session cookie
- Optional env: `ADMIN_USERNAME` + `ADMIN_PASSWORD` — seed admin pertama saat startup

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (Tailwind CSS 4, Framer Motion, React Query)
- API: Express 5 + bcryptjs (auth) + multer (file upload)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- File storage: local disk (`artifacts/api-server/uploads/`)

## Where things live

- `artifacts/peradi-portal/src/App.tsx` — semua halaman publik + useUrlTab routing
- `artifacts/peradi-portal/src/AdminPanel.tsx` — panel admin multi-role
- `artifacts/peradi-portal/src/main.tsx` — entry point, split Admin vs Public
- `artifacts/api-server/src/routes/peserta.ts` — endpoint publik + stats
- `artifacts/api-server/src/routes/admin.ts` — endpoint admin (auth + CRUD peserta)
- `artifacts/api-server/src/routes/member.ts` — registrasi dan auth anggota
- `artifacts/api-server/src/routes/forum.ts` — forum diskusi anggota
- `artifacts/api-server/src/routes/storage.ts` — file upload endpoint
- `artifacts/api-server/src/lib/adminAuth.ts` — logika auth, requireAdmin, requireRole
- `lib/db/src/schema/peserta.ts` — source of truth DB schema peserta
- `lib/db/src/schema/adminUsers.ts` — source of truth DB schema admin
- `lib/db/src/schema/members.ts` — source of truth DB schema member
- `lib/db/src/schema/forum.ts` — source of truth DB schema forum
- `lib/api-spec/openapi.yaml` — source of truth API contract (708 baris)
- `lib/api-client-react/src/generated/api.ts` — generated hooks (jangan edit manual)
- `lib/object-storage-web/` — library file upload (ObjectUploader + useUpload)
- `artifacts/peradi-portal/public/logo-peradi-nobg.png` — logo PERADI transparan
- `artifacts/api-server/uploads/` — folder file upload peserta (selfie, bukti bayar, KTA)

## Architecture decisions

- **URL routing dengan useUrlTab custom hook** (pushState/popstate) untuk halaman publik — bukan React Router/Wouter. Admin `/admin` di-handle di main.tsx secara terpisah.
- **File upload ke local disk** (multer) — bukan Replit Object Storage, agar compatible saat deploy ke Linode VPS.
- **Session auth berbasis cookie** (bcrypt + signed cookie) — bukan JWT. Session tidak disimpan di DB, hanya cookie signed.
- **Role-based access**: `full_access` | `registrasi` | `keuangan` | `spectator`. `full_access` TIDAK otomatis include di semua `requireRole()` — harus ditulis eksplisit.
- **Deploy target: Linode VPS** (bukan Replit Deployments) — PM2 + Nginx reverse proxy.

## Product

Portal MUSCAB II menyediakan:
- Halaman publik: beranda, daftar peserta, pengumuman, agenda, tata tertib, dokumen, LPJ, kuorum, hasil sidang (rekapitulasi suara live)
- Pendaftaran peserta online (multipart/form-data: selfie, bukti transfer, foto KTA)
- Live stats pendaftaran (polling 30s)
- Panel admin multi-role: verifikasi pembayaran, kelola status peserta, check-in hari-H, kelola admin users
- Forum diskusi anggota (member-only)

## Constraints PERMANEN (tidak boleh diubah)

1. **Footer:** `"Dikembangkan oleh Irwan, S.H. berkolaborasi dengan Replit © 2026"` — TIDAK BOLEH diubah/dihapus
2. **`lib/object-storage-web`** WAJIB ada di root `tsconfig.json` references
3. **Deploy: Linode VPS** (bukan Replit Deployments)
4. **File uploads: local disk multer** (bukan Replit Object Storage)

## User preferences

- Footer credit WAJIB ada: "Dikembangkan oleh Irwan, S.H. berkolaborasi dengan Replit © 2026"
- Project adalah bagian dari Entity Hub Networking oleh Irwan, S.H.
- Filosofi: AI dan manusia sebagai partner setara, bukan atasan-bawahan
- Deploy target: Linode VPS dengan Nginx + PM2
- File upload: local disk multer

## Gotchas

- `@types/multer` harus versi `^2.2.0` (versi 1.x tidak ada di npm)
- `lib/object-storage-web/tsconfig.json` butuh `"lib": ["esnext", "dom", "dom.iterable"]`
- Setelah ubah `openapi.yaml` → wajib `pnpm --filter @workspace/api-spec run codegen`
- Setelah ubah DB schema → wajib `pnpm --filter @workspace/db run push`
- `full_access` TIDAK otomatis include di `requireRole()` — tulis eksplisit di setiap route
- Path stripping di useUrlTab: pakai `startsWith`, BUKAN `replace`
- ADMIN_USERNAME + ADMIN_PASSWORD harus di-set di Replit Secrets agar seed admin berjalan

## Pending (Agent 11 — agenda sebelum hari-H 25 Juli 2026)

1. **Konfirmasi deploy Linode** — script `deploy/install-all.sh` berhenti di step PostgreSQL. Perlu:
   ```bash
   systemctl start postgresql && systemctl enable postgresql
   sudo -u postgres psql -c "CREATE USER peradi WITH PASSWORD 'PASSWORD_DARI_ENV';"
   sudo -u postgres psql -c "CREATE DATABASE peradi_muscab OWNER peradi;"
   cd /var/www/peradi && bash deploy/install-all.sh
   ```
2. **SSL/HTTPS** — pasang Let's Encrypt Certbot setelah portal live di Linode
3. **Notifikasi WhatsApp** — kirim WA ke peserta saat status pembayaran berubah (Fonnte/WABLAS)
4. **Backup DB otomatis** — cron job pg_dump harian di Linode

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Rekapan Agent 9: `attached_assets/rekapan.agent9_1783105423872.md`
- Rekapan Sesi 2 (desain): `attached_assets/rekapan.agent9-sesi2-desain_1783105423875.md`
- Rekapan Agent 10: `attached_assets/rekapan.agent10_1783106758200.md`
