import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
let browser, vite;
try {
  vite = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { host: '127.0.0.1', port: 0 },
  });
  await vite.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error(e.message));
  await page.clock.install({ time: new Date('2026-10-17T00:00:00Z') });
  await page.goto(
    `http://127.0.0.1:${vite.httpServer.address().port}/docs/plans/evidence/2026-10-17-post-f06/routing-freshness.html`,
  );
  await expect(page.getByRole('status')).toContainText('ready');
  await page.clock.fastForward(301000);
  await expect(page.getByRole('status')).toContainText('ready');
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Verification expired');
  console.log(
    'CONFIRMED A3: mounted RoutingStatus remains ready after301seconds; reload renders expired. Main detail polling stops for settled ready routes.',
  );
} finally {
  if (browser) await browser.close();
  if (vite) await vite.close();
}
