/* global window, document -- Browser callbacks executed by Playwright. */
import { expect } from '@playwright/test';

export async function verifyCancelledAddressResolution(page) {
  const address = page.getByLabel('Reported address');
  await address.fill('Original confirmed address');
  await page.getByRole('option', { name: 'Original confirmed address' }).click();
  await page.getByRole('button', { name: 'Select location on map', exact: true }).click();
  await page.evaluate(() => {
    const original = window.google.maps.importLibrary;
    window.google.maps.importLibrary = async (name) => {
      const library = await original(name);
      if (name !== 'places') return library;
      return {
        ...library,
        AutocompleteSuggestion: {
          fetchAutocompleteSuggestions: async () => ({
            suggestions: [
              {
                placePrediction: {
                  placeId: 'deferred',
                  text: { toString: () => 'Deferred address' },
                  toPlace: () => ({
                    formattedAddress: 'Deferred address',
                    location: { lat: () => -38, lng: () => 145 },
                    types: ['street_address'],
                    fetchFields: () =>
                      new Promise((resolve) => {
                        window.finishAddress = resolve;
                      }),
                  }),
                },
              },
            ],
          }),
        },
      };
    };
  });
  await address.fill('Deferred address');
  await page.getByRole('option', { name: 'Deferred address' }).click();
  await expect.poll(() => page.evaluate(() => typeof window.finishAddress)).toBe('function');
  await page
    .getByRole('region', { name: 'Reported location' })
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await page.evaluate(async () => {
    window.finishAddress();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  await expect(address).toHaveValue('Original confirmed address');
  await expect(page.getByRole('region', { name: 'Reported location' })).toContainText(
    '-37.814000, 144.963000',
  );
  await expect(page.getByRole('option')).toHaveCount(0);
}

export async function verifyPinTokens(page) {
  await expect
    .poll(() =>
      page.evaluate(() => window.__civicmapsFakeMarkers.filter((marker) => marker.map).length),
    )
    .toBeGreaterThan(0);
  const pins = await page.evaluate(() => {
    const style = window.getComputedStyle(document.querySelector('.operational-map'));
    return {
      expected: style.getPropertyValue('--civic-accent').trim(),
      actual: window.__civicmapsFakeMarkers.find(
        (marker) => marker.title === 'Selected request' && marker.map,
      )?.content?.dataset.background,
    };
  });
  expect(pins.actual).toBe(pins.expected);
}
