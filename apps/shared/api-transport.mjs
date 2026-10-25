export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const genericFailure = 'The operation could not be completed';
const timeoutFailure = 'The request timed out. Check the service state before retrying.';
const networkFailure = 'The service could not be reached. Check your connection and try again.';

export class ApiError extends Error {
  constructor(status, message = genericFailure, kind = 'http') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

export class ApiTransportError extends Error {
  constructor(kind, status = null) {
    super(kind === 'timeout' ? timeoutFailure : networkFailure);
    this.name = 'ApiTransportError';
    this.kind = kind;
    this.status = status;
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

    if (!response.ok) throw new ApiError(response.status, responseMessage(payload));
    if (!text.trim() || malformed)
      throw new ApiError(response.status, genericFailure, 'invalid-response');
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (callerCancelled) throw new RequestCancelledError();
    if (timedOut) throw new ApiTransportError('timeout', response?.status ?? null);
    throw new ApiTransportError('network', response?.status ?? null);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', cancelFromCaller);
  }
}

export function isRequestCancelled(error) {
  return error instanceof RequestCancelledError;
}
