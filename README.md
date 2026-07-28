# Project Health v0.10.1 — Programs Hotfix

This hotfix repairs the non-responsive Programs page and connects active custom routines to the workout calendar.

## Fixed

- New Program button now reliably opens the builder
- Create button now reliably opens the builder
- Mode cards show a clear selected state
- Starter templates install with visible confirmation
- Existing v0.9 profiles are normalized so missing program fields do not break the page
- Switching profiles initializes program data correctly
- Added visible action confirmations

## Integration added

- Activated custom or hybrid programs now appear in the weekly plan
- Scheduled custom workout days replace the default workout for that day
- Starting a scheduled day opens the custom exercise list
- Custom sets, reps, and rest settings carry into the guided workout
- Coach PH still supplies warm-up, optional finisher, load guidance, and partial-completion adjustments

## Install

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.10.1.ps1
.\Validate-ProjectHealth-v0.10.1.ps1
```

Upload everything inside the OneDrive `Project Health\deploy` folder to GitHub.

Recommended commit:

`v0.10.1 "Programs Hotfix" - Functional Builder & Calendar Integration`
