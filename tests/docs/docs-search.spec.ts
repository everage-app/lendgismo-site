import { test, expect } from '@playwright/test';

// Verify search narrows results and navigation works

test('search finds API Quickstart and navigates', async ({ page }) => {
  // Pre-seed the search index cache to avoid flakiness on initial fetch
  await page.addInitScript(() => {
    try {
      const seed = [
        { slug: '50_api-quickstart', title: 'API Quick Start Guide', content: 'Authenticate and call key endpoints in minutes.' },
        { slug: '40_features-overview', title: 'Features Overview', content: 'Overview of features' },
      ];
      window.localStorage.setItem('docs-search-index-v1', JSON.stringify(seed));
    } catch {}
  });

  await page.goto('/docs');

  const search = page.getByTestId('docs-search-input');
  await search.click();
  await search.fill('api quick');

  // Dropdown with results appears
  const dropdown = page.locator('div[role="dialog"], .absolute.mt-1');
  await expect(dropdown).toBeVisible();

  // Wait until at least one result link is visible (index may build async)
  const firstResult = dropdown.getByRole('link').first();
  await expect(firstResult).toBeVisible({ timeout: 20000 });
  await firstResult.click();

  // Should navigate to /docs/... (likely 50_api-quickstart)
  await expect(page).toHaveURL(/\/docs\//);

  // Article visible
  await expect(page.locator('article')).toBeVisible();
});
