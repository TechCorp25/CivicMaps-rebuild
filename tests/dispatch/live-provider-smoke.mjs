import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
try {
  await page.goto('http://127.0.0.1:5173/');
  await page.getByLabel('Email', { exact: true }).fill('dispatch@alpha.example');
  await page.getByLabel('Password', { exact: true }).fill('CivicMAPS-local-2026!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.locator('.operational-map-canvas .gm-style').waitFor({ timeout: 20000 });
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  await page.getByLabel('Reported address').fill('Melbourne Town Hall');
  await page.getByRole('option').first().waitFor({ timeout: 15000 });
  await page.getByRole('option').first().click();
  await page.getByText('Location confirmed.', { exact: true }).waitFor({ timeout: 15000 });
  await page.screenshot({
    path: 'test-results/dispatch-location/live-provider-smoke.png',
    fullPage: true,
  });
  process.stdout.write(
    'PASS live Google map loaded and Places New resolved a synthetic address selection\n',
  );
} finally {
  await page
    .getByRole('button', { name: 'Dismiss new request' })
    .click()
    .catch(() => {});
  await browser.close();
}
