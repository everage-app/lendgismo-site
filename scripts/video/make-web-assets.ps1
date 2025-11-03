param(
  [Parameter(Mandatory=$true)][string]$FinalVideo,
  [string]$TargetRoot = "client/public/assets/showcase",
  [string]$Slug = "full_tour"
)

$ErrorActionPreference = "Stop"

# Auto-detect ffmpeg if not in PATH
if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){
  $ffmpegPath = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter ffmpeg.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty DirectoryName
  if($ffmpegPath){
    $env:Path = "$ffmpegPath;$env:Path"
    Write-Host "Auto-detected ffmpeg at: $ffmpegPath" -ForegroundColor Yellow
  } else {
    Write-Error "ffmpeg not found in PATH. Install via winget: winget install --id=Gyan.FFmpeg -e"; exit 1
  }
}

$FinalVideo = (Resolve-Path $FinalVideo).Path
if(-not (Test-Path $FinalVideo)){ throw "Missing FinalVideo: $FinalVideo" }

$stamp = (Get-Date).ToString("yyyyMMdd-HHmm")
$outDir = Join-Path $PSScriptRoot (Join-Path "..\.." (Join-Path $TargetRoot $stamp))
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$base = "demo_${Slug}"
$mp4 = Join-Path $outDir ("${base}.mp4")
$webm = Join-Path $outDir ("${base}.webm")
$poster = Join-Path $outDir ("${base}--desktop.png")

Write-Host "Copying MP4 to $mp4" -ForegroundColor Cyan
Copy-Item -Path $FinalVideo -Destination $mp4 -Force

Write-Host "Generating VP9 WebM (for Chrome/Firefox)" -ForegroundColor Cyan
& ffmpeg -y -i "$FinalVideo" -r 60 -c:v libvpx-vp9 -b:v 0 -crf 33 -pix_fmt yuv420p -row-mt 1 -c:a libopus -b:a 128k "$webm" | Out-Null

Write-Host "Extracting poster frame" -ForegroundColor Cyan
& ffmpeg -y -i "$FinalVideo" -vf "fps=1,scale=1920:-1:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -vframes 1 "$poster" | Out-Null

Write-Host "Assets ready in: $outDir" -ForegroundColor Green
Write-Host "Run docs showcase generator next to refresh manifest: node scripts/generate-showcase.cjs" -ForegroundColor Yellow
