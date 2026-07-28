# v0.14 → v0.15 Migration and Validation

## Before upload
- In v0.14, open Settings → Backup → Export Data.
- Confirm you know the email used for Project Health Cloud.
- Press Sync Now and note the last sync time.

## What is intentionally unchanged
- Supabase project URL and publishable key
- GitHub Pages redirect URL
- Database schema and Row Level Security policies
- Local storage key `projectHealthV014`
- Profile storage key `projectHealthProfilesV09`
- Active profile and device identity keys
- Original arrays for workouts, activities, meals, weights, victories, measurements, reflections, adaptive plans, meal plans and programs

## After upload
1. Open Project Health in a normal browser tab.
2. Confirm the badge says **AI Coach 0.15.0**.
3. Confirm your name and active local profile.
4. Verify at least one old workout, meal, weight and program.
5. Open Coach PH and send **Give me my daily briefing**.
6. Open Settings and confirm Cloud is signed in.
7. Press Sync Now.
8. On another browser/device, sign in and Restore From Cloud only after confirming the current device is correct.

## Rollback
The original uploaded v0.14 archive is included unchanged as `backup/project-health-v0.14.0-original.zip`. Since the main local storage key was not renamed, rolling back the site files does not require a data conversion.
