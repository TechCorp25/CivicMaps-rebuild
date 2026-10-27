/* global window, document -- Browser callbacks executed by Playwright. */
import { expect } from '@playwright/test';

export async function verifyMapReadiness(page, url) {
  await page.addInitScript(() => {
    const original = window.google.maps.importLibrary;
    const ready = new Promise((resolve) => {
      window.finishMapSetup = resolve;
    });
    window.google.maps.importLibrary = async (name) => {
      await ready;
      return original(name);
    };
  });
  await page.goto(url);
  const enter = page.getByRole('button', { name: 'Select location on map', exact: true });
  await expect(enter).toBeDisabled();
  await page.evaluate(() => window.finishMapSetup());
  await expect(enter).toBeEnabled();
  await enter.click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-38, 145));
  await page
    .getByRole('region', { name: 'Reported location' })
    .getByRole('button', { name: 'Use this location', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Reported location' })).toContainText(
    '-38.000000, 145.000000',
  );
}

export async function verifyDraftClearedOnAuthLoss(page, url) {
  let expired = false;
  let secondSession = false;
  const profile = () => ({
    actor: {
      id: secondSession ? 'dispatcher-b' : 'dispatcher-a',
      name: 'Synthetic dispatcher',
      role: 'DISPATCHER',
      tenant_id: secondSession ? 'council-b' : 'council-a',
      jurisdiction_id: 'synthetic-jurisdiction',
      branch_id: 'synthetic-branch',
    },
    csrfToken: 'synthetic-csrf',
    entitlements: {
      packId: 'synthetic',
      version: 1,
      mode: 'active',
      capabilities: ['requests.read', 'requests.create'],
    },
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/login') {
      expired = false;
      secondSession = true;
    }
    if (expired) return route.fulfill({ status: 401, json: { error: 'Session expired' } });
    if (path.startsWith('/api/auth/')) return route.fulfill({ json: profile() });
    if (path === '/api/requests')
      return route.fulfill({ json: { requests: [], nextCursor: null } });
    return route.fulfill({ status: 404, json: { error: 'Unexpected test request' } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Select SR location on map' }).click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-38, 145));
  await page.getByRole('button', { name: 'Use this location', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Reported address')).toHaveValue(
    'Synthetic map location, Melbourne VIC',
  );
  // A focus refresh exercises the same scheduled load as the background timer.
  expired = true;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await page.getByLabel('Email').fill('dispatcher-b@example.test');
  await page.getByLabel('Password').fill('synthetic-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select SR location on map' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  await expect(page.getByLabel('Reported address')).toHaveValue('');
  await expect(page.getByRole('dialog')).not.toContainText('-38.000000, 145.000000');
  await page.getByLabel('Dispatch notes').fill('Retain these unsaved notes');
  await page.getByLabel('Reported address').fill('Synthetic address');
  await expect(page.getByRole('option', { name: 'Synthetic address' })).toBeVisible();
  await page.getByLabel('Reported address').press('Escape');
  await expect(page.getByRole('dialog').getByRole('option')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Dispatch notes')).toHaveValue('Retain these unsaved notes');
  await page.getByLabel('Reported address').press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

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

export async function verifyMapModeTransitions(page) {
  const region = page.getByRole('region', { name: 'Reported location' });
  const address = page.getByLabel('Reported address');
  await address.fill('Original address');
  await page.getByRole('option', { name: 'Original address' }).click();
  const enter = page.getByRole('button', { name: 'Select location on map', exact: true });
  await enter.click();
  await enter.click();
  await region.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(address).toHaveValue('Original address');
  await expect(region).toContainText('-37.814000, 144.963000');
  await enter.click();
  await page.evaluate(() => window.__civicmapsFakeMapClick(-38, 145));
  await address.fill('Replacement address');
  await page.getByRole('option', { name: 'Replacement address' }).click();
  await expect(region.getByRole('button', { name: 'Cancel', exact: true })).toHaveCount(0);
  await expect(region).toContainText('-37.814000, 144.963000');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__civicmapsFakeMarkers.find((marker) => marker.position && !marker.title)
            ?.position,
      ),
    )
    .toEqual({ lat: -37.814, lng: 144.963 });
  await page.evaluate(() => window.__civicmapsFakeMapClick(-39, 146));
  await expect(region).toContainText('-37.814000, 144.963000');
  expect(
    await page.evaluate(() => window.__civicmapsFakeMaps.some((map) => map.listeners.has('click'))),
  ).toBe(false);
}
