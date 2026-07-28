# Project Health v0.13.0 — Stable Cloud

GitHub-ready release with Supabase account creation, cross-device sync, mobile service-worker stability, and guarded one-time cloud restore.

## Deploy

Upload **all files and folders inside this release** to the root of the `Project-Health` GitHub repository, replacing existing files. Keep the folder structure intact.

The cloud configuration is already enabled for project `sjiyrjztdgvazuupftow`. The included key is the browser-safe Supabase publishable key, not a secret/service-role key.

## First mobile launch after deployment

Because older builds installed a looping service worker, perform this once on any affected phone:

1. Remove the Project Health home-screen app if installed.
2. Clear website data for `kingjoelm.github.io`.
3. Open the GitHub Pages site in the normal browser.
4. Confirm it remains stable, then reinstall it to the home screen.

## Main fixes

- Stops automatic service-worker activation/reload loops.
- Reloads only after an intentional update or completed restore.
- Prevents duplicate cloud-load calls during authentication startup.
- Compares Supabase `updated_at` with the device's last sync before restoring.
- Writes the cloud timestamp locally before the single restore refresh.
- Keeps `cloud/config.js` network-only so old project URLs cannot remain cached.
- Uses cache-busted v0.13.0 core scripts.
