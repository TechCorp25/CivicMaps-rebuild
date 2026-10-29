import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  intakeDefinition,
  validateIntake,
} from '../../domains/service-requests-dispatch/intake.mjs';

test('department intake schemas enforce owner-required Parking and Animal fields', () => {
  assert.equal(
    validateIntake('parking', {
      schemaVersion: 1,
      fields: {
        serviceType: 'parking',
        vehicleColour: 'Blue',
        allegedOffence: 'Reported obstruction',
      },
    }).definition.key,
    'parking',
  );
  assert.equal(
    validateIntake('animal-management', {
      schemaVersion: 1,
      fields: { reason: 'Wandering animal', animalType: 'Dog' },
    }).definition.key,
    'animal-management',
  );
  assert.throws(
    () =>
      validateIntake('parking', {
        schemaVersion: 1,
        fields: { serviceType: 'parking', vehicleColour: 'Blue' },
      }),
    { status: 400 },
  );
  assert.throws(
    () => validateIntake('animal-management', { schemaVersion: 1, fields: { reason: 'Injured' } }),
    { status: 400 },
  );
});

test('branch variants reject stale, unknown and malformed request details', () => {
  assert.deepEqual(intakeDefinition('local-laws').types, ['noise', 'permits', 'building']);
  assert.equal(
    validateIntake('local-laws', {
      schemaVersion: 1,
      fields: {
        serviceType: 'noise',
        reportedTime: '21:15',
        zoneType: 'Residential',
        noiseType: 'music',
      },
    }).payload.fields.reportedTime,
    '21:15',
  );
  assert.equal(
    validateIntake('local-laws', { schemaVersion: 1, fields: { serviceType: 'noise' } }).payload
      .fields.reportedTime,
    undefined,
  );
  assert.equal(
    validateIntake('waste-management', { schemaVersion: 1, fields: {} }).definition.key,
    'waste-management',
  );
  assert.throws(
    () => validateIntake('local-laws', { schemaVersion: 1, fields: { serviceType: 'parking' } }),
    { status: 400 },
  );
  assert.throws(
    () =>
      validateIntake('parking', {
        schemaVersion: 1,
        fields: {
          serviceType: 'parking',
          vehicleColour: 'Blue',
          allegedOffence: 'Report',
          code: 'X',
        },
      }),
    { status: 400 },
  );
  assert.throws(() => validateIntake('parking', { schemaVersion: 99, fields: {} }), {
    status: 409,
  });
  assert.throws(
    () =>
      validateIntake('local-laws', {
        schemaVersion: 1,
        fields: { serviceType: 'noise', noiseType: 'unreviewed code' },
      }),
    { status: 400 },
  );
  assert.throws(
    () =>
      validateIntake('local-laws', {
        schemaVersion: 1,
        fields: { serviceType: 'permits', noiseType: 'music', zoneType: 'Residential' },
      }),
    { status: 400 },
  );
  assert.throws(
    () => validateIntake('local-laws', { schemaVersion: 1, unauthorised: true, fields: {} }),
    { status: 400 },
  );
});
