# Project Health v0.6 — Next Phase

This package is designed to live in OneDrive as the working source for Project Health.

## New in v0.6

- Progressive overload suggestions using prior set history
- Restaurant Mode with one-change coaching
- Evening reflection and tomorrow planning
- Weight trend chart
- Eight-week workout consistency chart
- Body measurement tracking
- Existing Coach PH guidance, weekly workouts, exercise photos, detailed instructions, 5-minute incline warm-up, 15-minute incline finisher, meal logging, rest timer, and feedback system retained

## Recommended OneDrive structure

Project Health/
- deploy/
- releases/v0.6/
- backups/
- Install-ProjectHealth-v0.6.ps1
- Validate-ProjectHealth-v0.6.ps1

## Install into OneDrive

Open PowerShell in the extracted release folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.6.ps1
.\Validate-ProjectHealth-v0.6.ps1
```

The default target is:

`C:\Users\<your-user>\OneDrive\Project Health`

To use another path:

```powershell
.\Install-ProjectHealth-v0.6.ps1 -ProjectRoot "C:\Your\Exact\OneDrive\Project Health"
.\Validate-ProjectHealth-v0.6.ps1 -ProjectRoot "C:\Your\Exact\OneDrive\Project Health"
```

Then upload everything inside `Project Health\deploy` to the GitHub repository root.
