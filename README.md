# Project Health v0.10 — Custom Programs

This release supports experienced users who already have a routine.

## New

- Coach Mode
- My Program mode
- Hybrid mode
- Activity-first mode
- Custom workout program builder
- Multiple workout days
- Schedule days of the week
- Add exercises from the exercise library
- Edit sets, rep ranges, and rest time
- Duplicate and delete programs
- Activate a preferred program
- Starter templates:
  - Push / Pull / Legs
  - Upper / Lower
  - 3-Day Full Body
  - Planet Fitness Machines
  - Beginner Strength
- Coach PH program review:
  - Weekly set count
  - Average session volume
  - Missing push, pull, or lower-body patterns
  - Basic recovery and workload warnings

## OneDrive install

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Install-ProjectHealth-v0.10.ps1
.\Validate-ProjectHealth-v0.10.ps1
```

Upload everything inside `Project Health\deploy` to GitHub.

Recommended commit:

`v0.10 "Custom Programs" - Workout Builder, Templates & Hybrid Coaching`
