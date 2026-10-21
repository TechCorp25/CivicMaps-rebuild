export async function verifySlowQueueRefresh(page, expect) {
  let slowPageStarted = false;
  let slowPageFinished = false;
  let refreshesDuringSlowPage = 0;
  const route = async (intercepted) => {
    const query = new URL(intercepted.request().url()).searchParams;
    if (!query.has('before') && slowPageStarted && !slowPageFinished) refreshesDuringSlowPage++;
    if (query.has('before') && !slowPageStarted) {
      slowPageStarted = true;
      await new Promise((resolve) => setTimeout(resolve, 10_500));
      slowPageFinished = true;
    }
    await intercepted.continue();
  };

  await page.route(/\/api\/requests\?status=all(?:&|$)/, route);
  try {
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect.poll(() => slowPageStarted).toBe(true);
    await expect.poll(() => slowPageFinished, { timeout: 20_000 }).toBe(true);
    await expect(page.locator('.queue-pagination .muted')).toContainText('matching loaded records');
    await page.getByLabel('Search loaded requests').fill('Queue active 1004');
    await expect(page.locator('.request-table tbody tr')).toHaveCount(1);
    await expect(page.locator('.request-table tbody')).toContainText('Queue active 1004');
    expect(refreshesDuringSlowPage).toBe(0);
    await page.getByLabel('Search loaded requests').fill('');
  } finally {
    await page.unroute(/\/api\/requests\?status=all(?:&|$)/, route);
  }
}
