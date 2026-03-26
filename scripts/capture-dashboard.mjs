import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Login
await page.goto('http://localhost:5000/login', { timeout: 15000 });
await page.waitForTimeout(2000);
await page.fill('input[type=email]', 'admin@example.com');
await page.fill('input[type=password]', 'admin123');
await page.click('button[type=submit]');
await page.waitForTimeout(5000);

const afterLoginUrl = page.url();
console.log('After login URL:', afterLoginUrl);

// Wait for toast to disappear
await page.waitForTimeout(6000);

// Dismiss any remaining toast by clicking away
try { await page.click('body', { position: { x: 10, y: 10 } }); } catch {}
await page.waitForTimeout(1000);

// Screenshot the clean dashboard
await page.screenshot({ path: 'client/public/assets/showcase/dashboard-hero.png', fullPage: false });
console.log('Screenshot saved to dashboard-hero.png');

await browser.close();
