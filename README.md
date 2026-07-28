# Project Health v0.12.1 — Cloud Connection

This package is preconfigured for the confirmed Project Health Supabase project and GitHub Pages URL.

## Already configured

- Supabase project URL
- GitHub Pages site URL
- Authentication redirect URL
- Cloud identity and local-first sync code
- Database schema and Row Level Security

## Still required

You must insert your browser-safe Supabase **Publishable key** locally.

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Configure-ProjectHealth-Cloud-v0.12.1.ps1
.\Validate-ProjectHealth-Cloud-v0.12.1.ps1
.\Install-ProjectHealth-v0.12.1.ps1
```

The configuration script rejects Supabase Secret and service-role keys.

Recommended commit:

`v0.12.1 "Cloud Connection" - Supabase Project Configuration & Safe Key Setup`
