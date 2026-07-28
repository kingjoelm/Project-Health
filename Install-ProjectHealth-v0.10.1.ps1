param(
  [string]$ProjectRoot = "$env:USERPROFILE\OneDrive\Project Health"
)

$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Deploy = Join-Path $ProjectRoot "deploy"
$Release = Join-Path $ProjectRoot "releases\v0.10.1"
$Backup = Join-Path $ProjectRoot ("backups\pre-v0.10.1-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

Write-Host "Project Health v0.10.1 OneDrive installer" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $ProjectRoot,$Deploy,(Split-Path $Release),(Split-Path $Backup) | Out-Null

if (Test-Path $Deploy) {
  New-Item -ItemType Directory -Force -Path $Backup | Out-Null
  Get-ChildItem $Deploy -Force | Copy-Item -Destination $Backup -Recurse -Force
}

$Items = @("assets","data","docs","index.html","app.js","manifest.webmanifest","service-worker.js","README.md","CHANGELOG.md")
foreach ($item in $Items) {
  $src = Join-Path $Source $item
  if (Test-Path $src) {
    Copy-Item $src -Destination $Deploy -Recurse -Force
  }
}

if (Test-Path $Release) { Remove-Item $Release -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Release | Out-Null
Get-ChildItem $Deploy -Force | Copy-Item -Destination $Release -Recurse -Force

Write-Host ""
Write-Host "Installed to: $Deploy" -ForegroundColor Green
Write-Host "Release copy: $Release" -ForegroundColor Green
Write-Host "Backup: $Backup" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: upload everything inside the deploy folder to GitHub." -ForegroundColor Cyan
