# Project Health Changelog

## 0.13.0 — Stable Cloud

- Correct Supabase project configuration embedded and enabled.
- Permanent mobile service-worker reload-loop correction.
- Duplicate authentication reconciliation removed.
- Cloud timestamps compared before automatic restore.
- One-time guarded refresh after cloud restore.
- Manual Restore From Cloud now asks before replacing device data.
- Cloud config bypasses the service-worker cache.
- Core scripts cache-busted to build 130.

## 0.12.2 — Cloud Cache Hotfix

- Corrected the Supabase project URL typo.
- Removed cloud/config.js from the service-worker precache.
- Added network-only loading for cloud/config.js.
- Bumped cache and application versions.
- Added instructions for clearing the stale service worker once.
