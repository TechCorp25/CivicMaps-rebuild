/* global window -- Evaluated by Playwright in the browser page. */
import { expect } from '@playwright/test';

export async function verifyMapPickedServiceRequest(page, save, database) {
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const input = page.getByLabel('Reported address');
  await input.fill('Latest synthetic address');
  await expect(page.getByRole('option', { name: 'Latest synthetic address' })).toBeVisible();
  await page.getByRole('option', { name: 'Latest synthetic address' }).click();
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await input.fill('Changed free text invalidates the previous address point');
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Dismiss new request' }).click();

  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const mapAddress = page.getByLabel('Reported address');
  await mapAddress.fill('Slow stale query');
  await page.waitForFunction(() =>
    window.__CIVICMAPS_TEST_PREDICTION_CALLS__?.includes('Slow stale query'),
  );
  await page.getByRole('button', { name: 'Select location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-37.812, 144.961));
  await page.getByRole('button', { name: 'Use this location' }).click();
  await page.waitForTimeout(900);
  await expect(page.getByRole('option', { name: 'Slow stale query' })).toHaveCount(0);
  await expect(page.getByLabel('Confirmed latitude')).toHaveValue('-37.812000');
  await expect(page.getByLabel('Confirmed longitude')).toHaveValue('144.961000');
  await expect(mapAddress).toHaveValue('Synthetic map location, Melbourne VIC');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  const created = await save(page, 'Create request', 201);
  const saved = (
    await database.query('SELECT latitude,longitude FROM service_requests WHERE id=$1', [
      created.id,
    ])
  ).rows[0];
  expect(Number(saved.latitude)).toBe(-37.812);
  expect(Number(saved.longitude)).toBe(144.961);

  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const cancelAddress = page.getByLabel('Reported address');
  await cancelAddress.fill('Cancellation address');
  await page.getByRole('option', { name: 'Cancellation address' }).click();
  await page.getByRole('button', { name: 'Select location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-37.81, 144.96));
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByLabel('Confirmed latitude')).toHaveValue('-37.814000');
  await page.getByRole('button', { name: 'Select location on map' }).click();
  const centre = page.getByRole('button', { name: 'Choose map centre' });
  await centre.focus();
  await centre.press('Enter');
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByLabel('Confirmed latitude')).toHaveValue('-37.814000');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  const keyboardCreated = await save(page, 'Create request', 201);
  const keyboardPoint = (
    await database.query('SELECT latitude,longitude FROM service_requests WHERE id=$1', [
      keyboardCreated.id,
    ])
  ).rows[0];
  expect(Number(keyboardPoint.latitude)).toBe(-37.814);
  expect(Number(keyboardPoint.longitude)).toBe(144.963);
  return created;
}
