import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdmissionGate } from '../services/api/admission.mjs';

test('admission gate rejects without queueing and releases permits idempotently', () => {
  const gate = createAdmissionGate(1);
  const release = gate.tryAcquire();
  assert.equal(typeof release, 'function');
  assert.equal(gate.active, 1);
  assert.equal(gate.tryAcquire(), null);
  release();
  release();
  assert.equal(gate.active, 0);
  const next = gate.tryAcquire();
  assert.equal(typeof next, 'function');
  next();
  assert.throws(() => createAdmissionGate(0), TypeError);
});
