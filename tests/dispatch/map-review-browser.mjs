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
