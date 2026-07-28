# Project Health v0.12.1 — Next Steps

Your Supabase database and authentication redirect URL are configured.

## Complete the connection

1. In Supabase, open **Settings → API Keys**.
2. Copy only the **Publishable key**.
3. Do not copy the Secret key.
4. In PowerShell, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Configure-ProjectHealth-Cloud-v0.12.1.ps1
.\Validate-ProjectHealth-Cloud-v0.12.1.ps1
.\Install-ProjectHealth-v0.12.1.ps1
```

5. Upload the contents of your OneDrive `Project Health\deploy` folder to GitHub.
6. Open the live app in a private browser window.
7. Create an account and confirm the email.
8. Sign in, record one item, and press **Sync Now**.
9. Sign in on another browser/device and press **Restore From Cloud**.

## Development recommendation

Do not begin the larger normalized-database refactor until this complete account and sync test passes. The current JSON state is appropriate for the first private beta and gives us a working recovery path. After one week of stable cloud testing, Phase 13 should separate workouts, activities, nutrition, progress, and Coach PH memory into dedicated tables.
