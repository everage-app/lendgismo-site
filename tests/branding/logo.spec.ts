import { test, expect } from '@playwright/test';

const LOGO_FRAGMENT = 'lendgismo-logo-white-transparent.svg';

test.describe('Brand logo usage', () => {
  test('header logo uses transparent SVG on home', async ({ page }) => {
    await page.goto('/');
    const img = page.getByTestId('img-logo');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', new RegExp(LOGO_FRAGMENT));
  });

  test('docs header logo uses transparent SVG', async ({ page }) => {
    await page.goto('/docs');
    const img = page.getByTestId('img-logo');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', new RegExp(LOGO_FRAGMENT));
  });

  test('footer logo uses transparent SVG', async ({ page }) => {
    await page.goto('/');
    const footerImg = page.getByTestId('img-footer-logo');
    await expect(footerImg).toBeVisible();
    await expect(footerImg).toHaveAttribute('src', new RegExp(LOGO_FRAGMENT));
  });
});
