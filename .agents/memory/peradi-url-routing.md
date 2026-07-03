---
name: PERADI URL routing
description: Deep-link URL routing via useUrlTab() hook instead of React Router/Wouter for the main public App.tsx
---

# URL Routing — PERADI Portal

## The rule
`App.tsx` uses a `useUrlTab()` hook (custom, based on the browser `pushState`/`popstate` API) to sync the active "tab" (page) with the URL, instead of `wouter`/React Router. `/admin` is handled separately in `main.tsx` (mounts `AdminPanel` directly) and must not be routed through `useUrlTab()`.

**Why:** the app originally used component-state navigation (no URL changes at all), which meant links like `domain.com/daftar` could not deep-link to the registration form — anyone sharing a direct link to a specific page just landed on the homepage. This was flagged as a real operational risk (registration drop-off) since links are shared over WhatsApp/Instagram before the event.

## How to apply
- Path normalization must strip the artifact's base path using `startsWith`, not `replace` — `replace` can match the base-path substring elsewhere in the URL and corrupt the resulting tab path.
- Trailing slashes must be handled explicitly (normalise before comparing/looking up the tab).
- Deep links that must keep working: `/daftar`, `/pengumuman`, `/agenda`, `/tata-tertib`, `/dokumen`, `/lpj`, `/kuorum`, `/hasil`, plus browser back/forward.
- Do not swap this back to component-state navigation or introduce a second routing system for the public pages — `/admin` intentionally stays outside `useUrlTab()` and is handled in `main.tsx`.
