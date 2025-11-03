import { test, expect } from '@playwright/test';

// Validate quick links in the sidebar work and keep the docs shell

test('quick link: Integrations Demo opens inside docs layout', async ({ page }) => {
  await page.goto('/docs');

  // Click Integrations Demo quick link
  await page.getByRole('link', { name: 'Integrations Demo' }).click();
  await expect(page).toHaveURL(/\/docs\/demo\/integrations/);

  // Still have Docs header and sidebar
  await expect(page.getByText('Docs').first()).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Overview', exact: true })).toBeVisible();

  // Page title in content
  await expect(page.getByRole('heading', { name: 'Integrations Demo' })).toBeVisible();
});


test('quick link: Integrations doc opens and shows content', async ({ page }) => {
  await page.goto('/docs');

  await page.getByRole('link', { name: 'Integrations', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/40_integrations/);

  // Verify some content load by checking for a heading in the article
  const article = page.locator('article');
  await expect(article).toBeVisible();
  await expect(article.locator('h1, h2').first()).toBeVisible();
});

// Comprehensive sidebar doc link navigation test
test('all main sidebar docs load correctly', async ({ page }) => {
  // Sample of key docs from different sections
  const docsToTest = [
    { slug: '10_architecture', titleFragment: 'Architecture' },
    { slug: '40_features-overview', titleFragment: 'Features' },
    { slug: '50_api-quickstart', titleFragment: 'API' },
    { slug: '60_local-dev', titleFragment: 'Local' },
    { slug: '30_configuration', titleFragment: 'Configuration' },
    { slug: '20_data-model', titleFragment: 'Data Model' },
  ];

  for (const doc of docsToTest) {
    await page.goto(`/docs/${doc.slug}`);
    await expect(page).toHaveURL(new RegExp(`/docs/${doc.slug}`));
    const article = page.locator('article');
    await expect(article).toBeVisible();
    await expect(article.locator('h1, h2').first()).toContainText(new RegExp(doc.titleFragment, 'i'));
  }
});
