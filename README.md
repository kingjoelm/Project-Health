# Project Health v0.8.1 — Guided Workout

## Fixed
- Replaced all repeated exercise images.
- Added one unique generated gym image for every exercise.
- Removed screenshot text from exercise images.
- Standardized all images to the same 16:9 dimensions.

## New guided workout flow
- Warm-up
- One exercise at a time
- Set-by-set logging
- Automatic rest timer
- Previous-performance display
- Coach PH adaptive load recommendation
- Previous and next controls
- Incline finisher
- Workout summary
- Honest partial-workout saving
- Automatic lower-stress next workout when completion is below 70%

## Install into OneDrive
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.8.1.ps1
.\Validate-ProjectHealth-v0.8.1.ps1
```

Upload everything inside the OneDrive `Project Health\deploy` folder to GitHub.

Recommended commit:
`v0.8.1 "Guided Workout" - Unique Exercise Images & Session Flow`
