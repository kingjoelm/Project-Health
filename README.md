# Project Health v0.7 — Adaptive Training Engine

## New
- Pre-workout assessment for feeling, available time, desired effort, and pain.
- Recovery Score and Training Stress.
- Automatic full, reduced, or minimum-day workout.
- Automatic adjustment of exercise count, sets, suggested load, warm-up, and finisher.
- If fewer than 70% of sets are completed, Coach PH reduces the next session.
- Pain, soreness, fatigue, and low completion reduce load and workout stress.
- 15-, 30-, 45-, and 60-minute options.
- Full sessions retain the 5-minute incline warm-up and 15-minute incline finisher.

## Install into OneDrive
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.7.ps1
.\Validate-ProjectHealth-v0.7.ps1
```

Default root:
`C:\Users\Ironman\OneDrive\Project Health`

Upload everything inside the `deploy` folder to GitHub.
