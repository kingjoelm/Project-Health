param(
  [string]$ProjectRoot = "$env:USERPROFILE\OneDrive\Project Health"
)
$ErrorActionPreference="Stop"
$Deploy=Join-Path $ProjectRoot "deploy"
$Required=@("index.html","app.js","manifest.webmanifest","service-worker.js","data\workouts.json","assets\icons\icon-192.svg")
foreach($f in $Required){
  $p=Join-Path $Deploy $f
  if(!(Test-Path $p)){throw "Missing required file: $p"}
}
$js=Get-Content (Join-Path $Deploy "app.js") -Raw
if($js -notmatch 'projectHealthV0101'){throw "app.js is not v0.10.1"}
$html=Get-Content (Join-Path $Deploy "index.html") -Raw
if($html -notmatch 'Beta 0.10.1'){throw "index.html is not v0.10.1"}
Write-Host "Project Health v0.10.1 deploy tree validated." -ForegroundColor Green
Write-Host "Root: $Deploy"
