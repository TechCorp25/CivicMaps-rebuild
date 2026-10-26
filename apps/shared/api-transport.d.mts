export const DEFAULT_REQUEST_TIMEOUT_MS: number;

export class ApiError extends Error {
  status: number;
  kind: 'http' | 'invalid-response';
  uncertainWrite: boolean;
  constructor(
    status: number,
    message?: string,
    kind?: 'http' | 'invalid-response',
    uncertainWrite?: boolean,
  );
}

export class ApiTransportError extends Error {
  status: number | null;
  kind: 'timeout' | 'network';
  uncertainWrite: boolean;
  constructor(kind: 'timeout' | 'network', status?: number | null, uncertainWrite?: boolean);
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
export function getHttpStatus(error: unknown): number | null;
export function isUncertainWriteError(
  error: unknown,
): error is (ApiError | ApiTransportError) & { uncertainWrite: true };
