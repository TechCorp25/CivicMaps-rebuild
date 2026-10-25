export const DEFAULT_REQUEST_TIMEOUT_MS: number;

export class ApiError extends Error {
  status: number;
  kind: 'http' | 'invalid-response';
  constructor(status: number, message?: string, kind?: 'http' | 'invalid-response');
}

export class ApiTransportError extends Error {
  status: number | null;
  kind: 'timeout' | 'network';
  constructor(kind: 'timeout' | 'network', status?: number | null);
}

export class RequestCancelledError extends Error {
  constructor();
}

export function requestJson<T>(
  prefix: string,
  path: string,
  options?: RequestInit,
  timeoutMs?: number,
): Promise<T>;

export function isRequestCancelled(error: unknown): error is RequestCancelledError;
