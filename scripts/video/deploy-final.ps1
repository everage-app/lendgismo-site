#!/usr/bin/env pwsh
# Quick deploy script for after video render completes
param([switch]$SkipBuild)

$ErrorActionPreference = "Stop"

Write-Host "`n==> Step 1: Generate web assets (MP4 + WebM + poster)`n" -ForegroundColor Cyan
& pwsh -File .\scripts\video\make-web-assets.ps1 `
  -FinalVideo "C:\Users\bepho\OneDrive\Desktop\Lendgismo\Lendgismo Demo - FINAL.mp4" `
  -Slug "full_tour"

Write-Host "`n==> Step 2: Refresh showcase manifest`n" -ForegroundColor Cyan
& node .\scripts\generate-showcase.cjs

if(-not $SkipBuild){
  Write-Host "`n==> Step 3: Deploy to Netlify (production)`n" -ForegroundColor Cyan
  & npx netlify deploy --build --prod
} else {
  Write-Host "`n==> Skipped deploy. Run manually: npx netlify deploy --build --prod`n" -ForegroundColor Yellow
}

Write-Host "`nDone. Your polished hero video is live at https://lendgismo.com/`n" -ForegroundColor Green
