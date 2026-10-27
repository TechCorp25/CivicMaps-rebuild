/* global window -- Browser callbacks executed by Playwright. */
import { readFile } from 'node:fs/promises';
import { expect } from '@playwright/test';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import {
  verifyCancelledAddressResolution,
  verifyPinTokens,
  verifyMapModeTransitions,
  verifyMapReadiness,
  verifyDraftClearedOnAuthLoss,
} from './map-review-regressions.mjs';
const server = await createServer({
  configFile: false,
  define: { 'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify('synthetic-test-key') },
  root: process.cwd(),
  esbuild: { jsx: 'automatic' },
  optimizeDeps: {
    entries: ['tests/dispatch/map-review-harness.html', 'tests/dispatch/auth-loss-harness.html'],
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port: 0 },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({
    executablePath: process.env.CIVICMAPS_CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox'],
  });
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const coldPage = await browser.newPage();
  const fixture = await readFile('tests/dispatch/google-maps-sdk-fixture.mjs', 'utf8');
  await coldPage.route('https://maps.googleapis.com/**', (route) => {
    const callback = new URL(route.request().url()).searchParams.get('callback');
    return route.fulfill({
      contentType: 'text/javascript',
      body: `window.finishColdLoad = () => { ${fixture} ; window[${JSON.stringify(callback)}](); };`,
    });
  });
  await coldPage.goto(`${origin}/tests/dispatch/map-review-harness.html`);
  await expect.poll(() => coldPage.evaluate(() => typeof window.finishColdLoad)).toBe('function');
  await expect(
    coldPage.getByRole('button', { name: 'Select location on map', exact: true }),
  ).toBeDisabled();
  await coldPage.evaluate(() => window.finishColdLoad());
  await expect(
    coldPage.getByRole('button', { name: 'Select location on map', exact: true }),
  ).toBeEnabled();
  await coldPage.getByLabel('Reported address').fill('Street only result');
  await coldPage.getByRole('option', { name: 'Street only result' }).click();
  await expect(coldPage.getByRole('region', { name: 'Reported location' })).toContainText(
    'street or area',
  );
  await coldPage.getByLabel('Reported address').fill('Precise result');
  await coldPage.getByRole('option', { name: 'Precise result' }).click();
  await expect(coldPage.getByRole('region', { name: 'Reported location' })).toContainText(
    '-37.814000, 144.963000',
  );
  expect(
    await coldPage.evaluate(() => window.__civicmapsTokens[0] !== window.__civicmapsTokens[1]),
  ).toBe(true);
  await coldPage.close();
  const readinessPage = await browser.newPage();
  await readinessPage.addInitScript({ path: 'tests/dispatch/google-maps-sdk-fixture.mjs' });
  await verifyMapReadiness(readinessPage, `${origin}/tests/dispatch/map-review-harness.html`);
  await readinessPage.close();
  const authPage = await browser.newPage();
  await authPage.addInitScript({ path: 'tests/dispatch/google-maps-sdk-fixture.mjs' });
  await verifyDraftClearedOnAuthLoss(authPage, `${origin}/tests/dispatch/auth-loss-harness.html`);
  await authPage.close();
  const page = await browser.newPage();
  await page.addInitScript({ path: 'tests/dispatch/google-maps-sdk-fixture.mjs' });
  await page.goto(
    `http://127.0.0.1:${server.httpServer.address().port}/tests/dispatch/map-review-harness.html`,
  );
  await verifyMapModeTransitions(page);
  await verifyCancelledAddressResolution(page);
  await verifyPinTokens(page);
  console.log(
    'PASS: map readiness, authentication-loss cleanup, map-mode transitions, cancelled address resolution and canonical pin tokens',
  );
} finally {
  await browser?.close();
  await server.close();
}
