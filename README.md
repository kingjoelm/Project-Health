# Project Health v0.12 — Cloud Identity

This release adds the first secure account and cloud-sync foundation.

## Added

- Email/password registration
- Email/password sign-in
- Local-device sign-out
- Password-reset email
- Persistent browser sessions
- Local-first automatic sync
- Manual Sync Now
- Restore From Cloud
- Secure beta-feedback submission
- Delete Cloud Records
- Supabase SQL schema
- Row Level Security policies
- Cloud configuration file
- Offline/local fallback when cloud is not configured or unavailable

## Important

Cloud features remain disabled until you create a Supabase project, run `cloud/supabase-schema.sql`, and fill in `cloud/config.js`.

Do not place a Supabase service_role key in the browser app.

## OneDrive install

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.12.ps1
.\Validate-ProjectHealth-v0.12.ps1
```

Read `CLOUD_SETUP.md` before inviting cloud-account testers.

Recommended commit:

`v0.12 "Cloud Identity" - Secure Accounts, RLS & Local-First Sync`
