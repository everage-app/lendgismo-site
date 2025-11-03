import { test, expect } from '@playwright/test';

// Verify that changing only the hash (same slug) via sidebar quick links scrolls correctly

test('hash-only navigation within the same doc scrolls to target', async ({ page }) => {
  // Go directly to API Quickstart at an initial hash
  await page.goto('/docs/50_api-quickstart#authentication');

  // Sidebar quick links contain another anchor target, e.g., Documents
  const documentsLink = page.locator('aside').getByRole('link', { name: 'Documents', exact: true });
  await expect(documentsLink).toBeVisible();

  // Click it and assert hash updates and element is visible
  await documentsLink.click();
  await expect(page).toHaveURL(/\/docs\/50_api-quickstart#documents/);

  const target = page.locator('#documents');
  await expect(target).toBeVisible();
});
