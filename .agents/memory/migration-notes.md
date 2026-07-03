---
name: Migration notes
description: Catatan penting saat migrasi repo GitHub ke workspace Replit baru
---

# Catatan Migrasi dari GitHub

## Perubahan yang diperlukan saat migrasi

### @types/multer versi berubah
`@types/multer` di api-server/package.json harus menggunakan `^2.2.0`, bukan `^1.4.14`.
Versi 1.x sudah tidak ada di npm — package naik ke major 2.x.

**Why:** Migrasi ke workspace baru berarti fresh install, dan `^1.4.14` tidak resolve ke `2.2.0`.

**How to apply:** Saat membuat workspace baru dari repo ini, update `@types/multer` ke `^2.2.0` di `artifacts/api-server/package.json`.

### object-storage-web tsconfig perlu DOM lib
`lib/object-storage-web/tsconfig.json` harus include `"lib": ["esnext", "dom", "dom.iterable"]`.
Tanpa ini, TypeScript tidak mengenali `File`, `FormData`, `fetch`, dan DOM event types.

**Why:** tsconfig.base.json tidak include DOM lib secara default.

**How to apply:** Pastikan `lib/object-storage-web/tsconfig.json` punya `"lib": ["esnext", "dom", "dom.iterable"]`.

### OpenAPI spec di repo tidak lengkap
Repo hanya menyimpan `/healthz` di openapi.yaml, tapi frontend menggunakan banyak hooks.
Harus rebuild spec dari route files (`routes/peserta.ts`, `routes/admin.ts`) setelah migrasi.

**Why:** openapi.yaml di repo direset, generated files tidak di-commit ulang.

**How to apply:** Periksa semua import dari `@workspace/api-client-react` di App.tsx dan AdminPanel.tsx, rekonstruksi spec dari route files backend, jalankan codegen.

### logo-peradi.png ada di attached_assets
Logo PERADI disimpan sebagai `attached_assets/image_1783096143871.png`.
Perlu di-copy ke `artifacts/peradi-portal/public/logo-peradi.png`.

**Why:** Vite tidak bisa resolve `/logo-peradi.png` jika file tidak ada di `public/`.

### DB schema harus di-push ulang
Setiap workspace baru memerlukan `pnpm --filter @workspace/db run push` untuk membuat tabel.
Tanpa ini, `relation "peserta_muscab" does not exist` error di semua DB routes.

### peradi-portal tidak punya @workspace/object-storage-web di package.json
Tambahkan `"@workspace/object-storage-web": "workspace:*"` ke devDependencies peradi-portal.
