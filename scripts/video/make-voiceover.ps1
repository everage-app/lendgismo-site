param(
  [Parameter(Mandatory=$true)][string]$TextFile,
  [Parameter(Mandatory=$true)][string]$OutWav,
  [int]$Rate = -1,
  [int]$Volume = 100
)

$ErrorActionPreference = "Stop"

if(-not (Test-Path $TextFile)){ throw "TextFile not found: $TextFile" }
$text = Get-Content -Raw -Path $TextFile

# Use Windows built-in SAPI for local high-quality TTS (e.g., Microsoft Zira)
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Pick a female voice if available
$voice = $synth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Gender -eq 'Female' } | Select-Object -First 1
if($voice){ $synth.SelectVoice($voice.VoiceInfo.Name) }

$synth.Rate = [Math]::Max(-10, [Math]::Min(10, $Rate))
$synth.Volume = [Math]::Max(0, [Math]::Min(100, $Volume))

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutWav) | Out-Null

$synth.SetOutputToWaveFile($OutWav)
$synth.Speak($text)
$synth.Dispose()

Write-Host "Voiceover saved to: $OutWav" -ForegroundColor Green
