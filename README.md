# Project Health v0.9 — Private Beta

Project Health now supports people who prefer walking, running, cycling, mobility, recovery, or strength training.

## New in v0.9

- Walk tracking
- Run tracking
- Cycling tracking
- Stretch and mobility sessions
- Recovery sessions
- Session timer
- Manual distance entry for treadmill or GPS distance
- Pace calculation
- Activity goals
- One combined health dashboard
- Multiple local user profiles
- Separate history and data for every local profile
- Activity-focused onboarding goals
- Coach PH encouragement for non-gym activities
- Movement activity contributes to Momentum

## Important data limitation

Profiles and records are stored locally in the browser on the current device.

This version is suitable for a small private beta where each tester uses their own phone or computer. It does not yet provide:
- Cloud accounts
- Cross-device synchronization
- Password recovery
- Central owner access to tester data

Those require a secure backend and authentication in the next phase.

## Install into OneDrive

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.9.ps1
.\Validate-ProjectHealth-v0.9.ps1
```

Default project path:

`C:\Users\Ironman\OneDrive\Project Health`

Upload everything inside `Project Health\deploy` to GitHub.

Recommended commit:

`v0.9 "Private Beta" - Multi-Activity Tracking & Local User Profiles`
