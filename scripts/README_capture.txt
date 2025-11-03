Lendgismo Demo Capture Toolkit (Screenshots + Videos)
====================================================

Overview
--------
This toolkit uses Playwright to automatically capture high-quality screenshots and short demo videos
of your app (http://localhost:5000) and docs UI (http://localhost:5100). Assets are saved under:

  client/public/assets/showcase/<TIMESTAMP>/

You can safely attach/share these files or deploy them with the site.

Prerequisites
-------------
1) Install dependencies
   powershell
   npm install

2) Install Playwright browsers
   powershell
   npx playwright install

Configuration
-------------
Edit the capture plan to match your routes and preferred flows:
  scripts/capture-plan.json

- base.app   -> defaults to http://localhost:5000
- base.docs  -> defaults to http://localhost:5100
- screenshots: simple one-URL captures
- videos:     multi-step flows (each step is a URL)

Tip: You can override bases at runtime:
  powershell
  $env:BASE_APP = "http://localhost:5000"; $env:BASE_DOCS = "http://localhost:5100"; npm run capture:screens

Run: Screenshots
----------------
Capture desktop and mobile screenshots for each plan item:
  powershell
  npm run capture:screens

Outputs:
  .../01_home_app--desktop.png
  .../01_home_app--mobile.png
  .../10_docs_home--desktop.png
  .../10_docs_home--mobile.png

Run: Videos
-----------
Record short .webm videos for each flow in the plan:
  powershell
  npm run capture:videos

Outputs:
  .../demo_lender_journey.webm
  .../demo_docs_search.webm

Brand Overlay
-------------
Every capture adds a tasteful, translucent Lendgismo badge in the bottom-right corner.
Customize the label by editing "meta.brand" in scripts/capture-plan.json.

Auth / Gated Pages
------------------
If routes require login, start on a public URL that triggers your login screen. Then update the plan to
include that page first. If you need to script credentials, extend scripts/capture-demo.ts with a small
helper that fills your login form before proceeding. Example:

  await page.goto(`${base}/login`)
  await page.fill('input[type=email]', 'admin@example.com')
  await page.fill('input[type=password]', 'admin123')
  await page.click('button[type=submit]')
  await page.waitForLoadState('networkidle')

Troubleshooting
---------------
- Ensure the targets are actually running:
  - App:  http://localhost:5000
  - Docs: http://localhost:5100 (npm run docs:dev)
- If a page fails to load, the script will skip it and continue.
- To focus on docs only, temporarily comment out the app entries in scripts/capture-plan.json.

Where to Use Assets
-------------------
- Upload to your CMS or marketing pages
- Showcase component (client/src/components/Gallery.tsx)
- Netlify/landing sections
- Investor and sales materials

