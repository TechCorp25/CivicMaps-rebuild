import { test } from 'node:test';
import assert from 'node:assert/strict';
import { municipalityToken, municipalityHostname } from '../services/api/service-naming.mjs';
import { canonicalHost } from '../services/api/routing.mjs';

const alpha = '20000000-0000-4000-8000-000000000001';
const beta = '20000000-0000-4000-8000-000000000002';
test('all product labels fit DNS at registry boundaries and mapping is repeatable', () => {
  for (const length of [47, 48, 51, 52, 63]) {
    const slug = 'a'.repeat(length);
    for (const service of ['commandmaps', 'enforcementmaps', 'report']) {
      const hostname = municipalityHostname(slug, alpha, service);
      assert.ok(hostname.split('.')[0].length <= 63);
      assert.equal(canonicalHost(hostname), hostname);
      assert.equal(municipalityHostname(slug, alpha, service), hostname);
    }
    assert.equal(
      municipalityToken(slug, alpha),
      length === 47 ? slug : 'id-' + alpha.replaceAll('-', ''),
    );
  }
  assert.equal(
    municipalityHostname('synthetic-alpha', alpha),
    'alpha-commandmaps.dev.civicmaps.com.au',
  );
  assert.equal(
    municipalityHostname('synthetic-beta', beta),
    'beta-commandmaps.dev.civicmaps.com.au',
  );
  assert.throws(() => canonicalHost('a'.repeat(64) + '.dev.civicmaps.com.au'));
});
test('long shared prefixes and reserved-prefix registry slugs cannot collide', () => {
  const prefix = 'a'.repeat(47);
  const first = municipalityToken(prefix + 'a', alpha);
  assert.notEqual(first, municipalityToken(prefix + 'b', beta));
  assert.notEqual(first, municipalityToken(first, beta));
  assert.equal(municipalityToken('id-example', alpha), first);
});
test('missing or malformed identity and unrecognised products fail before route creation', () => {
  for (const id of [undefined, null, '', 'not-a-uuid', alpha.replaceAll('-', '')])
    assert.throws(() => municipalityToken('alpha', id));
  for (const slug of [undefined, '', '-alpha', 'alpha-', 'Alpha', 'a'.repeat(64)])
    assert.throws(() => municipalityToken(slug, alpha));
  assert.throws(() => municipalityHostname('alpha', alpha, 'unknown'));
});

test('acceptance aliases are reserved to their immutable fixture identities', () => {
  assert.notEqual(municipalityToken('alpha', beta), 'alpha');
  assert.notEqual(municipalityToken('beta', alpha), 'beta');
  assert.notEqual(municipalityToken('synthetic-alpha', beta), 'alpha');
});
