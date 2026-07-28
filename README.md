# Project Health v0.12.2 — Cloud Cache Hotfix

This fixes the Supabase connection issue caused by two problems:

1. The prior package contained a one-character typo in the Supabase project URL.
2. The service worker cached `cloud/config.js`, so GitHub Pages could continue serving the old URL even after the file was corrected.

## Correct Supabase URL

`https://sjjyrjztdgvqzuupftow.supabase.co`

## Important

After uploading this version, clear the old service worker/site data once:

- Firefox: DevTools → Application → Service Workers → Unregister
- Or browser settings → clear site data for `kingjoelm.github.io`
- Then reopen Project Health

`cloud/config.js` is no longer stored in the offline cache.

Paste your complete browser-safe key beginning with `sb_publishable_` into `cloud/config.js`. Never use the Secret key.

Recommended commit:

`v0.12.2 "Cloud Cache Hotfix" - Correct Supabase URL & Bypass Cached Config`
