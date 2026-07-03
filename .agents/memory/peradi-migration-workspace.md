---
name: PERADI migration to new workspace
description: How the PERADI portal was synced from GitHub into a fresh Replit workspace and what to watch out for
---

## Source repo
GitHub: https://github.com/irwxx1/Memory-Execution-Agent

## Migration pattern
1. Downloaded all files via `curl -sf raw.githubusercontent.com/...` in parallel
2. Backed up to /tmp, deleted directory, called `createArtifact` for clean registration
3. Copied backup files back over scaffold with `cp -rT`
4. DB tables created via `executeSql` (drizzle-kit push failed because DATABASE_URL not available in shell context at that moment)

## Missing deps that needed adding
- `bcryptjs` + `@types/bcryptjs` → api-server
- `multer` + `@types/multer` → api-server
- `zod` → api-server (for route validation)
- `lib/object-storage-web` → new lib, needs `@types/react` + dom lib in its tsconfig

## object-storage-web tsconfig fix
Must include `"lib": ["esnext", "dom", "dom.iterable"]` and `"types": ["react"]` so React/DOM types resolve during composite build.

**Why:** It's a React component library compiled as a composite lib, but tsconfig.base.json defaults to Node-only types.

## suara_muscab unique constraint
Added via: `ALTER TABLE suara_muscab ADD CONSTRAINT suara_muscab_posisi_calon_idx UNIQUE (posisi, calon_index)`

**Why:** Schema had no DB-level uniqueness; concurrent inserts from ensureSuaraRows() could create duplicates.

## Voting auth fix
`PATCH /admin/suara` must be `requireRole("full_access")` only — not "registrasi".

**Why:** OpenAPI contract says full_access only; registrasi role being able to modify vote tallies is a security drift.

## App.tsx stats fetch
Use `${import.meta.env.BASE_URL}api/stats` (not bare `/api/stats`) to survive non-root BASE_PATH.
