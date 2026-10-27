/* global window -- Evaluated by Playwright in the browser page. */
import { expect } from '@playwright/test';

export async function verifyMapPickedServiceRequest(page, save, database) {
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const input = page.getByLabel('Reported address');
  await input.fill('Street only suggestion');
  await page.getByRole('option', { name: 'Street only suggestion' }).click();
  await expect(page.getByLabel('Reported location').getByRole('status')).toContainText(
    'street or area',
  );
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeDisabled();
  await input.fill('Latest synthetic address');
  await page.getByRole('option', { name: 'Latest synthetic address' }).click();
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await input.fill('Changed free text invalidates the previous address point');
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Dismiss new request' }).click();

  // The workspace map captures the SR point and seeds the composer’s shared draft.
  await page.getByRole('button', { name: 'Select SR location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-37.812, 144.961));
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Confirmed latitude')).toHaveValue('-37.812000');
  await expect(page.getByLabel('Confirmed longitude')).toHaveValue('144.961000');
  await expect(page.getByLabel('Reported address')).toHaveValue(
    'Synthetic map location, Melbourne VIC',
  );
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  const created = await save(page, 'Create request', 201);
  const saved = (
    await database.query('SELECT latitude,longitude FROM service_requests WHERE id=$1', [
      created.id,
    ])
  ).rows[0];
  expect(Number(saved.latitude)).toBe(-37.812);
  expect(Number(saved.longitude)).toBe(144.961);

  // A cancelled map change restores the confirmed address point; centre selection works by keyboard.
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const cancelAddress = page.getByLabel('Reported address');
  await cancelAddress.fill('Cancellation address');
  await page.getByRole('option', { name: 'Cancellation address' }).click();
  await page.getByRole('button', { name: 'Select location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-37.81, 144.96));
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeDisabled();
  await page
    .getByLabel('Reported location')
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
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

  // A failed reverse lookup keeps the exact map point and requires an explicit description.
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  await page.getByRole('button', { name: 'Select location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-37.8, 144.96));
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByLabel('Reported location').getByRole('status')).toContainText(
    'Location is pinned',
  );
  await page.getByLabel('Reported address').fill('Beside the western entrance');
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Confirmed latitude')).toHaveValue('-37.800000');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  const describedCreated = await save(page, 'Create request', 201);
  const describedPoint = (
    await database.query('SELECT latitude,longitude FROM service_requests WHERE id=$1', [
      describedCreated.id,
    ])
  ).rows[0];
  expect(Number(describedPoint.latitude)).toBe(-37.8);
  expect(Number(describedPoint.longitude)).toBe(144.96);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  await page.getByRole('button', { name: 'Select location on map' }).click();
  const overflow = await page
    .getByRole('region', { name: 'Reported location' })
    .evaluate((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  await page
    .getByRole('region', { name: 'Reported location' })
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await page.getByRole('button', { name: 'Dismiss new request' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  return created;
}
