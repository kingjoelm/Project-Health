# Project Health v0.15.0 — The AI Coach Experience

This is the complete v0.14 application upgraded in place. It contains all 67 original files plus the v0.15 Coach PH experience.

## Safe upgrade
1. Export a backup from the current app before deployment.
2. Upload every file in this ZIP to the same GitHub Pages repository root.
3. Do not delete or recreate the Supabase project/table.
4. Open the site and allow the new service worker to activate.
5. Verify your existing profile, meals, workouts, programs and progress before adding new data.
6. Sign in and use **Sync Now** after verification.

## Data and connection preservation
- Local state key remains `projectHealthV014`.
- Profile database remains `projectHealthProfilesV09`.
- Active profile and device IDs remain unchanged.
- The existing Supabase URL and publishable browser key remain unchanged.
- The existing `user_state` and `beta_feedback` integration remains unchanged.
- New Coach PH mode, memory and chat are included in the same existing cloud snapshot.

See `MIGRATION_AND_VALIDATION.md` before deployment.
