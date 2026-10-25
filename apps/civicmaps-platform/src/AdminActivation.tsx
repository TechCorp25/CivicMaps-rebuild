import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from './api';
import { isRequestCancelled } from '../../shared/api-transport.mjs';

type Status = {
  state: string;
  email?: string;
  contexts: { id: string; version: number; label: string }[];
  latest: { state: string; expiresAt: string } | null;
};
export function AdminActivation({
  id,
  csrf,
  signal,
  onError,
}: {
  id: string;
  csrf: string;
  signal: AbortSignal;
  onError: (error: unknown) => void;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [binding, setBinding] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    api<Status>(`/municipalities/${id}/activation`, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setStatus(value);
      })
      .catch((reason) => {
        if (!controller.signal.aborted && !isRequestCancelled(reason)) {
          setStatus(null);
          setError(reason.message);
          if (reason instanceof ApiError && reason.status === 401) onError(reason);
        }
      });
    return () => {
      signal.removeEventListener('abort', abort);
      controller.abort();
    };
  }, [id, refresh, onError, signal]);
  async function submit(event: FormEvent<HTMLFormElement>, disable = false) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!disable) {
      // Every issuance requires a fresh affirmative verification, including reissue.
      const verified = event.currentTarget.elements.namedItem('verified') as HTMLInputElement;
      verified.checked = false;
    }
    setLink('');
    setError('');
    setBusy(true);
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    try {
      const result = await api<{ activationUrl?: string }>(
        `/municipalities/${id}/activation${disable ? '/disable' : ''}`,
        {
          method: 'POST',
          headers: { 'x-csrf-token': csrf, 'Idempotency-Key': crypto.randomUUID() },
          body: JSON.stringify(
            disable
              ? {}
              : {
                  bindingId: binding,
                  verifiedEmail: form.get('verifiedEmail'),
                  recipientVerified: form.get('verified') === 'on',
                },
          ),
          signal: controller.signal,
        },
      );
      if (result.activationUrl) setLink(result.activationUrl);
      setRefresh((value) => value + 1);
    } catch (reason) {
      if (!isRequestCancelled(reason)) {
        setError(reason instanceof Error ? reason.message : 'Activation action failed');
        if (reason instanceof ApiError && reason.status === 401) onError(reason);
      }
    } finally {
      signal.removeEventListener('abort', abort);
      setBusy(false);
    }
  }
  const tokenState =
    status?.latest &&
    status.latest.state === 'Pending' &&
    new Date(status.latest.expiresAt).getTime() <= now
      ? 'Expired'
      : status?.latest?.state;
  return (
    <section className="card admin-activation">
      <h2>First administrator activation</h2>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p>Administrator: {status?.state ?? 'Unavailable'}</p>
      {status?.latest && (
        <p>
          Link: {tokenState} · Expires {new Date(status.latest.expiresAt).toLocaleString('en-AU')}
        </p>
      )}
      <button
        type="button"
        className="secondary"
        disabled={busy}
        onClick={() => {
          setError('');
          setRefresh((value) => value + 1);
        }}
      >
        Refresh activation status
      </button>
      {status?.state === 'Pending' && (
        <form onSubmit={(event) => void submit(event)}>
          <p>
            Verify {status.email} is the intended recipient before delivering a synthetic link.
            Reissue revokes earlier links.
          </p>
          <label>
            Activation context
            <select
              aria-label="Activation context"
              value={binding}
              onChange={(event) => setBinding(event.target.value)}
              required
            >
              <option value="">Select a council context</option>
              {status.contexts.map((context) => (
                <option value={context.id} key={context.id}>
                  {context.label} · Version {context.version}
                </option>
              ))}
            </select>
          </label>
          {!status.contexts.length && (
            <p>No effective council context is available. Activation remains pending.</p>
          )}
          <label>
            Verified recipient email
            <input name="verifiedEmail" type="email" required autoComplete="off" />
          </label>
          <label>
            <input name="verified" type="checkbox" required />I verified the intended recipient
          </label>
          <button disabled={busy || !binding} type="submit">
            {busy ? 'Issuing…' : 'Issue or reissue activation link'}
          </button>
        </form>
      )}
      {link && (
        <div className="credential">
          <p>
            Deliver once through the verified synthetic channel. If the response was lost, reissue a
            new link.
          </p>
          <label>
            Activation link
            <textarea aria-label="Activation link" value={link} readOnly rows={4} />
          </label>
        </div>
      )}
      {status && ['Pending', 'Activated'].includes(status.state) && (
        <form onSubmit={(event) => void submit(event, true)}>
          <label>
            <input type="checkbox" required />
            Revoke this administrator’s sessions and outstanding links
          </label>
          <button type="submit" className="secondary" disabled={busy}>
            Disable administrator
          </button>
        </form>
      )}
    </section>
  );
}
