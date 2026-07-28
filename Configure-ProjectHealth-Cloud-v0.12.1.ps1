param(
    [string]$PublishableKey
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $ScriptRoot "cloud\config.js"

Write-Host ""
Write-Host "Project Health Cloud Configuration v0.12.1" -ForegroundColor Cyan
Write-Host "Use only the Supabase Publishable Key." -ForegroundColor Yellow
Write-Host "Never use the Secret Key or service_role key." -ForegroundColor Red
Write-Host ""

if (-not (Test-Path $ConfigPath)) {
    throw "Could not find $ConfigPath"
}

if ([string]::IsNullOrWhiteSpace($PublishableKey)) {
    $SecureKey = Read-Host "Paste the Supabase Publishable Key" -AsSecureString
    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureKey)
    try {
        $PublishableKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    }
}

if ([string]::IsNullOrWhiteSpace($PublishableKey)) {
    throw "No publishable key was entered."
}

if ($PublishableKey -notmatch '^sb_publishable_' -and $PublishableKey -notmatch '^eyJ') {
    throw "That does not look like a Supabase Publishable/anon key. Do not use the Secret Key."
}

if ($PublishableKey -match '^sb_secret_' -or $PublishableKey -match 'service_role') {
    throw "Secret/service-role keys must never be placed in the browser app."
}

$EscapedKey = $PublishableKey.Replace('\', '\\').Replace('"', '\"')
$Content = @"
// Project Health Cloud configuration.
// Browser-safe Publishable Key only. Never place a Secret/service_role key here.
window.PROJECT_HEALTH_CLOUD = {
  enabled: true,
  supabaseUrl: "https://sjjyriztdgvqzuupftow.supabase.co",
  supabasePublishableKey: "$EscapedKey",
  redirectUrl: "https://kingjoelm.github.io/Project-Health/"
};
"@

Set-Content -Path $ConfigPath -Value $Content -Encoding UTF8
Write-Host ""
Write-Host "Cloud configuration saved successfully." -ForegroundColor Green
Write-Host "Next run:" -ForegroundColor Cyan
Write-Host "  .\Validate-ProjectHealth-Cloud-v0.12.1.ps1"
Write-Host "  .\Install-ProjectHealth-v0.12.1.ps1"
