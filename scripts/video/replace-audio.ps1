param(
  [Parameter(Mandatory=$true)][string]$InputVideo,
  [Parameter(Mandatory=$true)][string]$VoiceWav,
  [Parameter(Mandatory=$true)][string]$OutputVideo,
  [switch]$MixOriginal,
  [double]$OriginalVolume = 0.15
)

$ErrorActionPreference = "Stop"

if(-not (Test-Path $InputVideo)){ throw "Missing InputVideo: $InputVideo" }
if(-not (Test-Path $VoiceWav)){ throw "Missing VoiceWav: $VoiceWav" }

# Auto-detect ffmpeg if not in PATH
if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){
  $ffmpegPath = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter ffmpeg.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty DirectoryName
  if($ffmpegPath){ $env:Path = "$ffmpegPath;$env:Path" } else { throw "ffmpeg not found" }
}

if($MixOriginal){
  # Keep a touch of original track and mix the TTS on top
  $args = @(
    '-y',
    '-i', "$InputVideo",
    '-i', "$VoiceWav",
    '-filter_complex', "[0:a]volume=$OriginalVolume[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:normalize=1[a]",
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-shortest', '-movflags', '+faststart',
    "$OutputVideo"
  )
} else {
  # Replace audio fully with TTS
  $args = @(
    '-y',
    '-i', "$InputVideo",
    '-i', "$VoiceWav",
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-shortest', '-movflags', '+faststart',
    "$OutputVideo"
  )
}

& ffmpeg @args | Out-Null
Write-Host "Wrote: $OutputVideo" -ForegroundColor Green
