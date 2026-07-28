# Project Health v0.11 — Tester Beta

This release is designed for a small invite-only tester group.

## Added

- Tester consent and safety acknowledgement
- Unique tester ID
- Tester display name
- Tester package export with app data and diagnostics
- Install-to-device guidance
- PWA install prompt where supported
- Update available banner
- Backup-date tracking
- Copyable diagnostics
- Saved gym and home-gym locations
- On-demand location checking
- Nearby workout-place prompt

## Location limitation

The browser app can save a workout place and check proximity only when the user requests it while the app is open.

Reliable background arrival detection and automatic geofence notifications require a future native/mobile app, background location permission, and secure backend.

## Beta limitation

Records remain local to each tester's browser. Cloud accounts and central data collection are not included yet.

## Install

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.11.ps1
.\Validate-ProjectHealth-v0.11.ps1
```

Upload everything inside `Project Health\deploy` to GitHub.

Recommended commit:

`v0.11 "Tester Beta" - Consent, Install, Diagnostics & Workout Places`
