import { test, expect } from '@playwright/test';

// Basic smoke for Docs landing page and layout chrome
test('docs home renders with header, search, and sidebar', async ({ page }) => {
  await page.goto('/docs');

  // Header "Docs" label exists
  await expect(page.getByText('Docs').first()).toBeVisible();

  // Search input present
  const search = page.getByTestId('docs-search-input');
  await expect(search).toBeVisible();

  // Sidebar nav exists with Overview link
  await expect(page.locator('aside').getByRole('link', { name: 'Overview', exact: true })).toBeVisible();
});

// Verify clicking sidebar doc links from home works
test('clicking sidebar doc links from docs home navigates correctly', async ({ page }) => {
  await page.goto('/docs');

  // Pick a few sidebar links and verify they navigate and load content
  const linksToTest = [
    { name: 'System Architecture', slugPattern: /10_architecture/ },
    { name: 'Features Overview', slugPattern: /40_features-overview/ },
    { name: 'Local Development Guide', slugPattern: /60_local-dev/ },
    { name: 'Repository Inventory', slugPattern: /00_repo-inventory/ },
    { name: 'API Quick Start Guide', slugPattern: /50_api-quickstart/ },
  ];

  for (const link of linksToTest) {
    await page.goto('/docs'); // Reset to home
    const sidebarLink = page.locator('aside').getByText(link.name, { exact: true });
    await expect(sidebarLink).toBeVisible();
    await sidebarLink.click();
    await expect(page).toHaveURL(link.slugPattern);
    const article = page.locator('article');
    await expect(article).toBeVisible();
    await expect(article.locator('h1, h2').first()).toBeVisible();
  }
});
