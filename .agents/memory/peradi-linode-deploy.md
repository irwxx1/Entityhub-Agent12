---
name: PERADI linode deploy
description: Deploy setup untuk Linode VPS — scripts, GitHub remote, gotchas PostgreSQL
---

## Setup

- Deploy scripts ada di `deploy/` — `install-all.sh` adalah entry point utama
- GitHub remote: `https://github.com/irwxx1/Memory-Execution-Agent`
- Server path: `/var/www/peradi`
- API berjalan di port `3001` (PM2), Nginx proxy `/api` ke port 3001, static frontend di `/`
- File upload peserta di `artifacts/api-server/uploads/` — tidak di-serve langsung Nginx

## Gotcha: PostgreSQL tidak auto-start

**Why:** Pada Ubuntu 22.04 fresh install, PostgreSQL terinstall tapi systemd service tidak otomatis enabled dan started.

**How to apply:** Setiap kali setup server baru, SEBELUM jalankan `install-all.sh`, atau kalau script berhenti di step "Setup database PostgreSQL":
```bash
systemctl start postgresql
systemctl enable postgresql
```

## Alur update kode

1. Edit di Replit
2. Commit & Push via Replit Version Control sidebar (bukan terminal — auth tidak bisa via terminal)
3. Di Linode: `cd /var/www/peradi && bash deploy/deploy.sh`

## Build commands production

```bash
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/peradi-portal run build
pnpm --filter @workspace/api-server run build
```

Frontend build output: `artifacts/peradi-portal/dist/public/`
