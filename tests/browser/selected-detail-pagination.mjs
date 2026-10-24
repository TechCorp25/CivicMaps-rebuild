// Reproduce a refresh whose detail response arrives after a newer cursor load.
export async function verifyDetailDuringPagination(page, expect) {
  for (const denied of [false, true]) {
    await page
      .locator('.request-table tbody .request-link')
      .nth(denied ? 1 : 0)
      .click();
    await expect(page.locator('.detail h2')).toContainText('Queue active');
    let started = false;
    let releaseDetail;
    const gate = new Promise((resolve) => {
      releaseDetail = resolve;
    });
    const delayedDetail = async (route) => {
      started = true;
      const response = await route.fetch();
      const data = await response.json();
      await gate;
      await route.fulfill({
        status: denied ? 404 : 200,
        contentType: 'application/json',
        body: JSON.stringify(
          denied
            ? { error: 'Request not found' }
            : { ...data, address: 'Confirmed refreshed detail' },
        ),
      });
    };
    await page.route(/\/api\/requests\/[0-9a-f-]+$/, delayedDetail);
    try {
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await expect.poll(() => started).toBe(true);
      const queueStatus = page.locator('.queue-pagination .muted');
      const previous = await queueStatus.textContent();
      await page.getByRole('button', { name: 'Load more requests', exact: true }).click();
      await expect(queueStatus).not.toHaveText(previous);
      releaseDetail();
      if (denied) {
        await expect(
          page.getByRole('heading', { name: 'Selected request unavailable' }),
        ).toBeVisible();
        await expect(page.locator('.detail button')).toHaveCount(1);
      } else {
        await expect(page.locator('.detail h2')).toHaveText('Confirmed refreshed detail');
      }
    } finally {
      releaseDetail();
      await page.unroute(/\/api\/requests\/[0-9a-f-]+$/, delayedDetail);
    }
  }
}
