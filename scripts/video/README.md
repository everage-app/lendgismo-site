# Lendgismo Demo Video Pipeline

Complete workflow to produce a stunning, market-ready hero demo video with logo intro/outro, captions, and professional polish.

## Quick Start

```powershell
# 1) Render final polished video (1-minute crisp tour)
pwsh -File .\scripts\video\process-demo.ps1 `
  -InputVideo "C:\Users\bepho\OneDrive\Desktop\Lendgismo\Lendgismo Demo.mp4" `
  -LogoPath "C:\Users\bepho\OneDrive\Desktop\Lendgismo\lendgismo-logo-blackbg-white.png" `
  -SubtitlesPath ".\scripts\video\demo-captions-example.srt" `
  -OutputVideo "C:\Users\bepho\OneDrive\Desktop\Lendgismo\Lendgismo Demo - FINAL.mp4" `
  -Deshake `
  -TargetTotalMinutes 1

# 2) Generate web assets (MP4 + WebM + poster)
pwsh -File .\scripts\video\make-web-assets.ps1 `
  -FinalVideo "C:\Users\bepho\OneDrive\Desktop\Lendgismo\Lendgismo Demo - FINAL.mp4" `
  -Slug "full_tour"

# 3) Refresh showcase manifest
node .\scripts\generate-showcase.cjs

# 4) Preview locally
npm run docs:dev
# Visit http://localhost:5100/

# 5) Deploy to production
npx netlify deploy --build --prod
```

## What You Get

- **Intro**: 3s logo fade-in (1.5s fade)
- **Main**: Your demo sped up to fit target duration, with:
  - Crisp subtitles (Segoe UI Semibold, outlined for readability)
  - Optional deshake for stability
  - High-quality 60fps H.264 encode (CRF 18, preset slow)
- **Outro**: 2.5s logo fade-in + hold
- **Web assets**: MP4 + VP9 WebM + poster PNG (1920x1080)

## Options

### Target a specific total duration

```powershell
-TargetTotalMinutes 1.5  # Auto-computes speed to hit 90s total
```

### Manual speed override

```powershell
-Speed 1.2  # 20% faster (ignores TargetTotalMinutes)
```

### Skip deshake

```powershell
# Omit -Deshake if your capture is already stable
```

## Subtitle Editing

Edit `scripts/video/demo-captions-example.srt` timings and text to match your cut:

```srt
1
00:00:00,000 --> 00:00:04,500
Lendgismo Platform Overview — one-time code handoff. Own the code forever.

2
00:00:04,500 --> 00:00:09,000
Admin, Borrower, and Broker portals with RBAC and audit logging.
```

Tips:
- Keep lines under ~42 characters for readability
- Max 2 lines per subtitle
- Sync timings to key UI moments in your demo

## Web Staging

`make-web-assets.ps1` copies your final video into `client/public/assets/showcase/<timestamp>/` with:
- `demo_full_tour.mp4` (H.264)
- `demo_full_tour.webm` (VP9 for modern browsers)
- `demo_full_tour--desktop.png` (poster frame)

Then `generate-showcase.cjs` updates `manifest.json` so `FeaturedDemos.tsx` auto-picks the newest timestamp for the hero slot.

## Deployment

After staging and preview, deploy to Netlify:

```powershell
npx netlify deploy --build --prod
```

The new video will be live at https://lendgismo.com/ in the "See The Platform In Action" section.

## Troubleshooting

### FFmpeg not found

```powershell
winget install --id=Gyan.FFmpeg -e
```

The script auto-detects winget-installed ffmpeg and adds it to PATH for the session.

### Video too long/short

Adjust `-TargetTotalMinutes` or edit the raw capture before processing.

### Subtitles out of sync

Re-time the .srt file and re-run `process-demo.ps1`.

---

**Developed for Lendgismo — Production-ready lending platform codebase.**
