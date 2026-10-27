import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import {
  verifyCancelledAddressResolution,
  verifyPinTokens,
  verifyMapModeTransitions,
} from './map-review-regressions.mjs';
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  esbuild: { jsx: 'automatic' },
  optimizeDeps: {
    entries: ['tests/dispatch/map-review-harness.html'],
    include: ['react', 'react-dom/client'],
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
  const page = await browser.newPage();
  await page.addInitScript({ path: 'tests/dispatch/google-maps-sdk-fixture.mjs' });
  await page.goto(
    `http://127.0.0.1:${server.httpServer.address().port}/tests/dispatch/map-review-harness.html`,
  );
  await verifyMapModeTransitions(page);
  await verifyCancelledAddressResolution(page);
  await verifyPinTokens(page);
  console.log('PASS: map-mode transitions, cancelled address resolution and canonical pin tokens');
} finally {
  await browser?.close();
  await server.close();
}
