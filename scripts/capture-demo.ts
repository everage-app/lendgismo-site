import { chromium, Browser, Page, BrowserContext } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Types matching capture-plan.json structure
type WaitSpec = { state?: 'load'|'domcontentloaded'|'networkidle', delayMs?: number }

type ScreenSpec = {
  name: string
  origin: 'app'|'docs'
  url?: string
  candidates?: string[]
  wait?: WaitSpec
  injectSearch?: string
}

type VideoStep = (
  | { origin: 'app'|'docs'; url: string; wait?: WaitSpec; injectSearch?: string; action?: undefined }
  | { origin: 'app'|'docs'; action: 'clickHref'; href: string; wait?: WaitSpec }
  | { origin: 'app'|'docs'; action: 'scrollBy'; x?: number; y?: number; wait?: WaitSpec }
  | { origin: 'app'|'docs'; action: 'clickText'; text: string; fallbackHref?: string; wait?: WaitSpec }
  | { origin: 'app'|'docs'; action: 'pause'; ms: number }
)

type VideoSpec = {
  name: string
  steps: VideoStep[]
}

type Plan = {
  meta: {
    brand: string
    style: 'dark'|'light'
    viewport: { width: number, height: number }
    mobileViewport: { width: number, height: number }
  }
  base: { app: string, docs: string }
  screenshots: ScreenSpec[]
  videos: VideoSpec[]
  auth?: {
    origin: 'app'|'docs'
    loginPath: string
    emailSelector: string
    passwordSelector: string
    submitSelector: string
    email?: string
    password?: string
    postLoginWait?: WaitSpec
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLAN_PATH = path.resolve(__dirname, 'capture-plan.json')
const OUTPUT_ROOT = path.resolve(__dirname, '..', 'client', 'public', 'assets', 'showcase')

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

async function addBrandOverlay(page: Page, brand: string) {
  await page.addStyleTag({ content: `
    @keyframes subtleIn { from { opacity: 0 } to { opacity: 1 } }
    .brand-badge { position: fixed; z-index: 999999; right: 16px; bottom: 16px; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.9); font: 500 12px/1.2 ui-sans-serif,system-ui; letter-spacing: .02em; backdrop-filter: blur(6px); animation: subtleIn .3s ease both }
    .brand-badge b { color: rgb(168 85 247); font-weight: 600 }
  `})
  await page.evaluate((b: string) => {
    const el = document.createElement('div')
    el.className = 'brand-badge'
    el.textContent = b
    const strong = document.createElement('b')
    strong.textContent = ' • '
    el.appendChild(strong)
    el.appendChild(document.createTextNode(' Demo'))
    document.body.appendChild(el)
  }, brand)
}

async function waitSpec(page: Page, spec?: WaitSpec) {
  if (!spec) return
  const state = spec.state ?? 'load'
  await page.waitForLoadState(state)
  if (spec.delayMs) await page.waitForTimeout(spec.delayMs)
}

function originToBase(origin: 'app'|'docs', plan: Plan) {
  return origin === 'app' ? (process.env.BASE_APP || plan.base.app) : (process.env.BASE_DOCS || plan.base.docs)
}

async function doSearchInject(page: Page, term: string) {
  // Try focusing '/' shortcut and typing term; fallback to finding input[type="search"] or input placeholder
  try {
    await page.keyboard.press('/')
    await page.waitForTimeout(50)
    await page.keyboard.type(term, { delay: 30 })
    return
  } catch {}
  const candidates = ['input[type="search"]', 'input[placeholder*="Search" i]', 'input']
  for (const sel of candidates) {
    const has = await page.$(sel)
    if (has) {
      await page.fill(sel, term)
      break
    }
  }
}

async function captureScreens(plan: Plan) {
  const outDir = path.join(OUTPUT_ROOT, nowStamp())
  ensureDir(outDir)
  const browser = await chromium.launch({ headless: true })
  try {
    const ctx = await browser.newContext({ viewport: plan.meta.viewport })
    const page = await ctx.newPage()
    // Ensure servers are reachable
    await waitForServer(originToBase('app', plan), 20)
    await waitForServer(originToBase('docs', plan), 20)
    // Perform auth once if configured and any app shots exist
    if (plan.auth && plan.screenshots.some(s => s.origin === plan.auth!.origin)) {
      try {
        await doAuth(page, plan)
        console.log('✓ Auth completed for screenshots')
      } catch (e) {
        console.warn('! Auth failed (screenshots will proceed unauthenticated)')
      }
    }
    for (const shot of plan.screenshots) {
      const base = originToBase(shot.origin, plan)
      const urls: string[] = shot.candidates && shot.candidates.length
        ? shot.candidates.map(c => new URL(c, base).toString())
        : [new URL(shot.url || '/', base).toString()]
      let navigated = false
      for (const target of urls) {
        try {
          await page.goto(target, { waitUntil: 'load' })
          await waitSpec(page, shot.wait)
          navigated = true
          break
        } catch (err) {
          console.warn('! Candidate failed, trying next:', target)
        }
      }
      if (!navigated) {
        console.warn('! Skipped screenshot (no candidates succeeded):', shot.name)
        continue
      }
      try {
        await addBrandOverlay(page, plan.meta.brand)
        if (shot.injectSearch) await doSearchInject(page, shot.injectSearch)
        const fp = path.join(outDir, `${shot.name}--desktop.png`)
        await page.screenshot({ path: fp, fullPage: false })
        // Mobile variant
        await page.setViewportSize(plan.meta.mobileViewport)
        await waitSpec(page, { state: 'domcontentloaded', delayMs: 200 })
        const fpm = path.join(outDir, `${shot.name}--mobile.png`)
        await page.screenshot({ path: fpm, fullPage: false })
        // Restore desktop viewport for next step
        await page.setViewportSize(plan.meta.viewport)
        await waitSpec(page, { state: 'domcontentloaded', delayMs: 100 })
        console.log('✓ Screenshot', shot.name)
      } catch (err) {
        console.warn('! Skipped screenshot (navigation failed):', shot.name)
      }
    }
    await ctx.close()
  } finally {
    await browser.close()
  }
}

async function captureVideos(plan: Plan) {
  const outDir = path.join(OUTPUT_ROOT, nowStamp())
  ensureDir(outDir)
  const browser = await chromium.launch({ headless: true })
  try {
    for (const vid of plan.videos) {
      // Warm auth + storage state to avoid long white starts
      let stateFile: string | undefined
      let firstUrlStep = vid.steps.find((s: any) => s.url)
      try {
        const warm = await browser.newContext({ viewport: plan.meta.viewport })
        const warmPage = await warm.newPage()
        await waitForServer(originToBase('app', plan), 20)
        await waitForServer(originToBase('docs', plan), 20)
        if (plan.auth && vid.steps.some(s => s.origin === plan.auth!.origin)) {
          try {
            await doAuth(warmPage, plan)
            console.log(`✓ Auth completed for video: ${vid.name}`)
          } catch (e) {
            console.warn('! Auth failed for video (continuing):', vid.name)
          }
        }
        if (firstUrlStep) {
          const base = originToBase((firstUrlStep as any).origin, plan)
          const firstUrl = new URL((firstUrlStep as any).url, base).toString()
          try { await warmPage.goto(firstUrl, { waitUntil: 'domcontentloaded' }) } catch {}
        }
        stateFile = path.join(outDir, `${vid.name}.state.json`)
        await warm.storageState({ path: stateFile })
        await warm.close()
      } catch (e) {
        console.warn('! Warm-start failed; proceeding without storage state')
        stateFile = undefined
      }

      // Real recorded context starts here
  const ctx = await browser.newContext({ viewport: plan.meta.viewport, recordVideo: { dir: outDir, size: plan.meta.viewport }, ...(stateFile ? { storageState: stateFile } : {}) })
      const page = await ctx.newPage()
      // Immediately navigate to first useful frame to avoid white video start
      if (firstUrlStep) {
        const base = originToBase((firstUrlStep as any).origin, plan)
        const firstUrl = new URL((firstUrlStep as any).url, base).toString()
        try { await page.goto(firstUrl, { waitUntil: 'domcontentloaded' }) } catch {}
      }
  try { await addBrandOverlay(page, plan.meta.brand) } catch {}

      for (const step of vid.steps) {
        const base = originToBase((step as any).origin as any, plan)
        if ((step as any).action === 'pause') {
          await page.waitForTimeout((step as any).ms || 300)
          continue
        }
        if ((step as any).action === 'clickText') {
          const label = (step as any).text
          try {
            const btn = page.getByRole('button', { name: new RegExp(label, 'i') })
            if (await btn.count()) {
              await btn.first().scrollIntoViewIfNeeded()
              await btn.first().hover({ force: true })
              await page.waitForTimeout(120)
              await btn.first().click({ timeout: 3000 })
            } else {
              const textLoc = page.getByText(new RegExp(label, 'i')).first()
              if (await textLoc.count()) { await textLoc.click({ timeout: 3000 }) }
            }
            await waitSpec(page, (step as any).wait)
          } catch {
            const fh = (step as any).fallbackHref
            if (fh) {
              try { await page.goto(new URL(fh, base).toString(), { waitUntil: 'load' }) } catch {}
            }
          }
          continue
        }
        if ((step as any).action === 'clickHref') {
          const href = (step as any).href
          try {
            const link = page.locator(`a[href='${href}']`).first()
            const count = await link.count()
            if (count > 0) {
              await link.scrollIntoViewIfNeeded()
              await link.hover({ force: true })
              await page.waitForTimeout(120)
              await link.click({ timeout: 3000 })
            } else {
              await page.goto(new URL(href, base).toString(), { waitUntil: 'load' })
            }
            await waitSpec(page, (step as any).wait)
          } catch (err) {
            console.warn('! clickHref failed, continuing:', href)
          }
          continue
        }
        if ((step as any).action === 'scrollBy') {
          try {
            const dx = (step as any).x ?? 0
            const dy = (step as any).y ?? 400
            await page.mouse.wheel(dx, dy)
            await waitSpec(page, (step as any).wait)
          } catch (err) {
            console.warn('! scrollBy failed, continuing')
          }
          continue
        }
        // Default: navigate to URL
        const url = new URL((step as any).url, base).toString()
        try {
          await page.goto(url, { waitUntil: 'load' })
          await waitSpec(page, (step as any).wait)
          if ((step as any).injectSearch) await doSearchInject(page, (step as any).injectSearch)
        } catch (err) {
          console.warn('! Step failed (continuing):', url)
        }
      }
      const v = await page.video()
      await ctx.close()
      const tempPath = await v?.path()
      if (tempPath) {
        const target = path.join(outDir, `${vid.name}.webm`)
        fs.renameSync(tempPath, target)
        console.log('✓ Video', vid.name)
      }
    }
  } finally {
    await browser.close()
  }
}

async function main() {
  const mode = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'screens'
  if (!fs.existsSync(PLAN_PATH)) {
    console.error('Missing plan at', PLAN_PATH)
    process.exit(1)
  }
  const plan: Plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf8'))
  if (mode === 'screens') {
    await captureScreens(plan)
  } else if (mode === 'videos') {
    await captureVideos(plan)
  } else {
    console.error('Unknown mode. Use --mode=screens or --mode=videos')
    process.exit(1)
  }
  console.log('All done.')
}

main().catch(err => { console.error(err); process.exit(1) })

// Helpers
async function waitForServer(baseUrl: string, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(baseUrl, { method: 'GET' })
      if ((res as any).ok || (res as any).status) return
    } catch {}
    await new Promise(r => setTimeout(r, 300))
  }
}

async function doAuth(page: Page, plan: Plan) {
  const auth = plan.auth!
  const base = originToBase(auth.origin, plan)
  const email = process.env.LEND_EMAIL || auth.email || ''
  const password = process.env.LEND_PASSWORD || auth.password || ''

  const paths = [auth.loginPath, '/login', '/auth/login', '/signin', '/session', '/user/login']
  const emailSelectors = [auth.emailSelector, 'input[type=email]', 'input[name=email]', 'input[name=username]', 'input[autocomplete=email]']
  const passwordSelectors = [auth.passwordSelector, 'input[type=password]', 'input[name=password]', 'input[autocomplete=current-password]']
  const submitSelectors = [auth.submitSelector, 'button[type=submit]']

  let authed = false
  for (const p of paths) {
    const url = new URL(p, base).toString()
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      // Try Playwright role-based button first
      if (email) {
        for (const sel of emailSelectors) {
          const el = await page.$(sel)
          if (el) { await page.fill(sel, email); break }
        }
      }
      if (password) {
        for (const sel of passwordSelectors) {
          const el = await page.$(sel)
          if (el) { await page.fill(sel, password); break }
        }
      }
      // Click submit
      let clicked = false
      try {
        const btn = page.getByRole('button', { name: /sign in|log in|login|continue|submit/i })
        const count = await btn.count()
        if (count > 0) { await btn.first().click(); clicked = true }
      } catch {}
      if (!clicked) {
        for (const sel of submitSelectors) {
          const el = await page.$(sel)
          if (el) { await el.click(); clicked = true; break }
        }
      }
      await waitSpec(page, auth.postLoginWait || { state: 'networkidle', delayMs: 300 })
      authed = true
      break
    } catch {}
  }
  if (!authed) throw new Error('Auth not successful')
}
