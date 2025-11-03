import { test, expect } from '@playwright/test';

// Verify anchor quick links like Documents scroll to the right section

test('quick link: Documents anchor navigates and section is present', async ({ page }) => {
  await page.goto('/docs');

  // The quick link builds to /docs/50_api-quickstart#documents
  await page.getByRole('link', { name: 'Documents' }).click();

  // Wait for navigation and check hash
  await expect(page).toHaveURL(/\/docs\/50_api-quickstart#documents/);

  // The section heading should exist with id="documents"
  const target = page.locator('#documents');
  await expect(target).toBeVisible();

  // The article should be visible and contain content near the section
  const article = page.locator('article');
  await expect(article).toBeVisible();
});

// Test multiple quick link anchors in the sidebar
test('all quick link anchors navigate and scroll correctly', async ({ page }) => {
  await page.goto('/docs');

  const anchorsToTest = [
    { name: 'Authentication', hash: 'authentication' },
    { name: 'Loan Applications', hash: 'loan-applications' },
    { name: 'Borrowers', hash: 'borrowers-lenders-only' },
    { name: 'Dashboard', hash: 'dashboard' },
    { name: 'Errors', hash: 'error-handling' },
  ];

  for (const anchor of anchorsToTest) {
    // Find the link in the sidebar and click
    const link = page.locator('aside').getByRole('link', { name: anchor.name, exact: true });
    await expect(link).toBeVisible();
    await link.click();

    // Verify URL and section visibility
    await expect(page).toHaveURL(new RegExp(`#${anchor.hash}`));
    const target = page.locator(`#${anchor.hash}`);
    await expect(target).toBeVisible({ timeout: 10000 });
  }
});
