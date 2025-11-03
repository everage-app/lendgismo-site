param([string]$VideoPath)
$ff = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffprobe.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if($ff){
  $dir = Split-Path -Parent $ff
  $env:Path = "$dir;" + $env:Path
  $d = & ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 -- "$VideoPath" 2>$null
  Write-Output "DURATION_SEC=$d"
} else {
  Write-Output "FFPROBE_NOT_FOUND"
}
