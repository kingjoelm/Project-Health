$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $ScriptRoot "cloud\config.js"

if (-not (Test-Path $ConfigPath)) {
    throw "Missing cloud\config.js"
}

$Config = Get-Content $ConfigPath -Raw

$Checks = [ordered]@{
    "Cloud enabled" = $Config -match 'enabled:\s*true'
    "Correct Supabase URL" = $Config -match 'https://sjjyriztdgvqzuupftow\.supabase\.co'
    "Correct redirect URL" = $Config -match 'https://kingjoelm\.github\.io/Project-Health/'
    "Publishable key present" = (
        $Config -match 'sb_publishable_[A-Za-z0-9_-]+' -or
        $Config -match 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    )
    "No secret key" = (
        $Config -notmatch 'sb_secret_' -and
        $Config -notmatch 'service_role'
    )
}

Write-Host ""
Write-Host "Project Health Cloud Validation" -ForegroundColor Cyan

$Failed = $false
foreach ($Name in $Checks.Keys) {
    if ($Checks[$Name]) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        $Failed = $true
    }
}

if ($Failed) {
    throw "Cloud configuration validation failed."
}

Write-Host ""
Write-Host "Cloud configuration is ready for deployment." -ForegroundColor Green
