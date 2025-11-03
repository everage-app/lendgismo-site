param(
  [Parameter(Mandatory=$true)][string]$InputVideo,
  [Parameter(Mandatory=$true)][string]$LogoPath,
  [string]$OutputVideo,
  [string]$SubtitlesPath,
  [double]$Speed = 1.2,
  [double]$TargetTotalMinutes,
  [switch]$Deshake
)

$ErrorActionPreference = "Stop"

function Ensure-File($p, $label){
  if(-not (Test-Path $p)) { throw ("Missing {0}: {1}" -f $label, $p) }
}

function To-FFPath([string]$p){
  # Convert backslashes to forward slashes for ffmpeg filters
  return $p -replace '\\','/'
}

function Get-VideoDurationSeconds([string]$path){
  $p = & ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 -- "$path" 2>$null
  if([double]::TryParse($p, [ref]([double]$d))){ return [Math]::Round($d, 3) }
  return $null
}

function Build-AtempoChain([double]$factor){
  # Build a chain of atempo filters whose product ~= factor (each in [0.5,2.0])
  $ops = @()
  if([Math]::Abs($factor - 1.0) -lt 0.01){ return "anull" }
  while($factor -gt 2.0){ $ops += "atempo=2.0"; $factor = $factor / 2.0 }
  while($factor -lt 0.5){ $ops += "atempo=0.5"; $factor = $factor / 0.5 }
  $ops += ("atempo={0}" -f ([Math]::Round($factor, 3)))
  return [string]::Join(',', $ops)
}

# Resolve and validate inputs
$InputVideo  = (Resolve-Path $InputVideo).Path
$LogoPath    = (Resolve-Path $LogoPath).Path
Ensure-File $InputVideo  "InputVideo"
Ensure-File $LogoPath    "LogoPath"

if($SubtitlesPath){
  $SubtitlesPath = (Resolve-Path $SubtitlesPath).Path
  Ensure-File $SubtitlesPath "SubtitlesPath"
}

if(-not $OutputVideo){
  $dir = Split-Path $InputVideo -Parent
  $name = [System.IO.Path]::GetFileNameWithoutExtension($InputVideo)
  $OutputVideo = Join-Path $dir ("$name - Lendgismo FINAL.mp4")
}

# Check ffmpeg
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if(-not $ffmpeg){
  # Attempt to locate a winget-installed ffmpeg and add to PATH for this session
  $candidate = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
  if($candidate){
    $dir = Split-Path -Parent $candidate
    $env:Path = "$dir;" + $env:Path
    $ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
  }
}
if(-not $ffmpeg){
  Write-Error "ffmpeg not found. Install with: winget install --id=Gyan.FFmpeg -e"; exit 1
}

# Temp workspace
$temp = Join-Path $env:TEMP ("lendgismo-video-" + [System.Guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $temp | Out-Null
$intro = Join-Path $temp 'intro.mp4'
$main  = Join-Path $temp 'main.mp4'
$outro = Join-Path $temp 'outro.mp4'
$list  = Join-Path $temp 'list.txt'

# If target total duration requested, compute Speed that achieves it (accounting for intro/outro lengths)
$introSeconds = 3.0
$outroSeconds = 2.5
if($TargetTotalMinutes -and $TargetTotalMinutes -gt 0){
  $orig = Get-VideoDurationSeconds $InputVideo
  if($orig){
    $targetTotal = $TargetTotalMinutes * 60.0
    $targetMain = [Math]::Max(1.0, $targetTotal - $introSeconds - $outroSeconds)
    $Speed = [Math]::Round($orig / $targetMain, 3)
    Write-Host ("[speed] Auto-set to x{0} for target total {1}m (orig {2}s)" -f $Speed, $TargetTotalMinutes, [Math]::Round($orig,1)) -ForegroundColor Yellow
  }
}

try {
  Write-Host "[1/4] Building intro clip with 1.5s fade-in..." -ForegroundColor Cyan
  $null = & ffmpeg -y `
    -loop 1 -t 3 -i "$LogoPath" `
    -f lavfi -t 3 -i anullsrc=r=48000:cl=stereo `
    -filter_complex "[0:v]scale=-2:1080:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=rgba,fade=t=in:st=0:d=1.5:alpha=1,format=yuv420p[v]" `
    -map "[v]" -map 1:a -r 30 -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 128k -movflags +faststart `
    "$intro"

  Write-Host "[2/4] Processing main video (speed x$Speed, deshake: $Deshake)..." -ForegroundColor Cyan
  $vf = "[0:v]fps=30,scale=-2:1080:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"
  if($Deshake){ $vf += ",deshake=x=16:y=16:rx=32:ry=32:blocksize=16:contrast=125" }
  $vf += ",setpts=PTS/$Speed"
  if($SubtitlesPath){
    $subFF = To-FFPath $SubtitlesPath
    $vf += ",subtitles='$subFF':force_style='FontName=Segoe UI Semibold,FontSize=28,BorderStyle=3,Outline=2,OutlineColour=&H202020&,PrimaryColour=&H00FFFFFF&,Alignment=2,MarginV=50'"
  }
  $aChain = Build-AtempoChain $Speed
  $filter = "$vf[v];[0:a]$aChain[a]"

  $null = & ffmpeg -y -i "$InputVideo" `
    -filter_complex "$filter" -map "[v]" -map "[a]" `
    -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart `
    "$main"

  Write-Host "[3/4] Building outro clip (end on logo, 1.5s fade-in, hold)..." -ForegroundColor Cyan
  $null = & ffmpeg -y `
    -loop 1 -t 2.5 -i "$LogoPath" `
    -f lavfi -t 2.5 -i anullsrc=r=48000:cl=stereo `
    -filter_complex "[0:v]scale=-2:1080:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=rgba,fade=t=in:st=0:d=1.5:alpha=1,format=yuv420p[v]" `
    -map "[v]" -map 1:a -r 30 -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 128k -movflags +faststart `
    "$outro"

  Write-Host "[4/4] Concatenating intro + main + outro and finalizing..." -ForegroundColor Cyan
  "file '$intro'"  | Out-File -FilePath $list -Encoding ascii
  "file '$main'"   | Out-File -FilePath $list -Encoding ascii -Append
  "file '$outro'"  | Out-File -FilePath $list -Encoding ascii -Append

  $null = & ffmpeg -y -f concat -safe 0 -i "$list" `
    -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 128k -movflags +faststart `
    "$OutputVideo"

  Write-Host "Done." -ForegroundColor Green
  Write-Host "Output: $OutputVideo" -ForegroundColor Yellow
}
finally {
  # Cleanup temp files
  if(Test-Path $temp){ Remove-Item $temp -Recurse -Force | Out-Null }
}
