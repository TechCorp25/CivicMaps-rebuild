export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const genericFailure = 'The operation could not be completed';
const timeoutFailure = 'The request timed out. Check the service state before retrying.';
const networkFailure = 'The service could not be reached. Check your connection and try again.';
const uncertainWriteFailure =
  'The server may have saved this change, but its confirmation could not be read. Check the server state before trying again.';

export class ApiError extends Error {
  constructor(status, message = genericFailure, kind = 'http', uncertainWrite = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.uncertainWrite = uncertainWrite;
  }
}

export class ApiTransportError extends Error {
  constructor(kind, status = null, uncertainWrite = false) {
    super(kind === 'timeout' ? timeoutFailure : networkFailure);
    this.name = 'ApiTransportError';
    this.kind = kind;
    this.status = status;
    this.uncertainWrite = uncertainWrite;
  }
}

export class RequestCancelledError extends Error {
  constructor() {
    super('The request was cancelled');
    this.name = 'AbortError';
  }
}

function responseMessage(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.error !== 'string')
    return genericFailure;
  const message = payload.error.trim();
  if (!message || message.length > 240 || /<\/?[a-z][^>]*>/i.test(message)) return genericFailure;
  return message;
}

function joinPath(prefix, path) {
  return `${prefix.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function requestJson(
  prefix,
  path,
  options = {},
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) {
  const { signal: callerSignal, ...requestOptions } = options;
  const method = (requestOptions.method ?? 'GET').toUpperCase();
  const writeRequest = !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);
  if (callerSignal?.aborted) throw new RequestCancelledError();

  const controller = new AbortController();
  let callerCancelled = false;
  let timedOut = false;
  let response;
  const cancelFromCaller = () => {
    callerCancelled = true;
    controller.abort();
  };
  callerSignal?.addEventListener('abort', cancelFromCaller, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    response = await fetch(joinPath(prefix, path), {
      ...requestOptions,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    });
    const text = await response.text();
    let payload;
    let malformed = false;
    if (text.trim()) {
      try {
        payload = JSON.parse(text);
      } catch {
        malformed = true;
      }
    }

    if (!response.ok)
      throw new ApiError(
        response.status,
        responseMessage(payload),
        'http',
        writeRequest && response.status >= 500,
      );
    if (!text.trim() || malformed)
      throw new ApiError(
        response.status,
        writeRequest ? uncertainWriteFailure : genericFailure,
        'invalid-response',
        writeRequest,
      );
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (callerCancelled) throw new RequestCancelledError();
    if (timedOut) throw new ApiTransportError('timeout', response?.status ?? null, writeRequest);
    throw new ApiTransportError('network', response?.status ?? null, writeRequest);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', cancelFromCaller);
  }
}

export function isRequestCancelled(error) {
  return error instanceof RequestCancelledError;
}

export function getHttpStatus(error) {
  if (!error || typeof error !== 'object') return null;
  const { status } = error;
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : null;
}

export function isUncertainWriteError(error) {
  return error instanceof Error && 'uncertainWrite' in error && error.uncertainWrite === true;
}
