import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isRequestCancelled, requestJson } from '../../shared/api-transport.mjs';

export function Activation() {
  const [target] = useState(() => {
    const [, municipalityId, bindingId, token] = location.hash.slice(1).split('/');
    return { municipalityId, bindingId, token };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const redeemController = useRef<AbortController | null>(null);
  useEffect(() => {
    // The bearer secret stays in component memory, never in a request URL or storage.
    history.replaceState(null, '', location.pathname + location.search + '#activation');
  }, []);
  useEffect(() => () => redeemController.current?.abort(), []);
  async function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirm')) {
      setError('Passwords must match');
      return;
    }
    setBusy(true);
    setError('');
    const controller = new AbortController();
    redeemController.current?.abort();
    redeemController.current = controller;
    try {
      const data = await requestJson<{ email: string }>('/api', '/activation/redeem', {
        method: 'POST',
        body: JSON.stringify({ ...target, password: form.get('password') }),
        signal: controller.signal,
      });
      setEmail(data.email);
    } catch (reason) {
      if (!isRequestCancelled(reason) && redeemController.current === controller)
        setError(reason instanceof Error ? reason.message : 'Activation failed');
    } finally {
      if (redeemController.current === controller) {
        redeemController.current = null;
        setBusy(false);
      }
    }
  }
  const complete =
    typeof target.municipalityId === 'string' &&
    typeof target.bindingId === 'string' &&
    /^[a-f0-9]{64}$/.test(target.token ?? '');
  if (!complete)
    return (
      <main className="login">
        <section className="login-card">
          <h1>Activation link required</h1>
          <p>
            Open the complete link delivered by your Platform operator. If you no longer have it,
            ask the operator to verify your identity and reissue it.
          </p>
          <a href="/">Return to sign in</a>
        </section>
      </main>
    );
  return (
    <main className="login">
      <section className="login-card">
        <p className="eyebrow">CivicMAPS · Council administrator</p>
        <h1>{email ? 'Activation complete' : 'Activate your administrator profile'}</h1>
        {email ? (
          <>
            <p>Sign in as {email} with the password you chose.</p>
            <a href="/">Go to sign in</a>
          </>
        ) : (
          <>
            <p>
              Choose your password for the council context in your invitation. If a completed
              response was lost, try signing in. Expired or revoked links need reissue by your
              Platform operator.
            </p>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <form onSubmit={(event) => void redeem(event)}>
              <label>
                New password
                <input
                  type="password"
                  name="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirm"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" disabled={busy}>
                {busy ? 'Activating…' : 'Activate administrator'}
              </button>
            </form>
            <a href="/">Return to sign in</a>
          </>
        )}
      </section>
    </main>
  );
}
