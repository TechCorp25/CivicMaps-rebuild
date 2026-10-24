import { promisify } from 'node:util';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { createAdmissionGate } from './admission.mjs';

const scryptAsync = promisify(scrypt);
const storedHashPattern = /^[a-f0-9]{32}:[a-f0-9]{128}$/;
// Node's default libuv pool has four workers; cap password work at half that pool.
export const passwordWorkGate = createAdmissionGate(2);

export class MalformedPasswordHashError extends Error {
  constructor() {
    super('Stored password hash is malformed');
    this.name = 'MalformedPasswordHashError';
    this.code = 'ERR_PASSWORD_HASH_FORMAT';
  }
}

export class PasswordWorkUnavailableError extends Error {
  constructor() {
    super('Password work is at capacity');
    this.name = 'PasswordWorkUnavailableError';
    this.code = 'PASSWORD_WORK_CAPACITY';
    this.status = 503;
  }
}

async function derive(password, salt) {
  const release = passwordWorkGate.tryAcquire();
  if (!release) throw new PasswordWorkUnavailableError();
  try {
    return await scryptAsync(password, salt, 64);
  } finally {
    release();
  }
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await derive(password, salt)).toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !storedHashPattern.test(stored))
    throw new MalformedPasswordHashError();
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(await derive(password, salt), Buffer.from(hash, 'hex'));
}

export async function verifyPasswordSafely(password, stored, dummyHash) {
  if (typeof stored !== 'string' || !storedHashPattern.test(stored)) {
    // Retain the unknown-user timing path without recording any stored hash or identity.
    console.error('Stored password hash failed format validation');
    await verifyPassword(password, dummyHash);
    return false;
  }
  return verifyPassword(password, stored);
}
