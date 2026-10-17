import { useEffect, useState } from 'react';
import { type ServiceRoute } from './api';
export function RoutingStatus({
  routes,
  unavailable = false,
  busy,
  onRefresh,
  onAction,
}: {
  routes: ServiceRoute[];
  unavailable?: boolean;
  busy: boolean;
  onRefresh: () => void;
  onAction: (route: ServiceRoute, action: 'retry' | 'withdraw') => void;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    // Expire the mounted view even when the next request is slow or unavailable.
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="card" aria-labelledby="routing-heading">
      <h2 id="routing-heading">Service routing</h2>
      <p>Development destinations are verified separately from administrator activation.</p>
      {routes.length ? (
        routes.map((route) => (
          <div key={route.id}>
            <p>
              <strong>{route.hostname}</strong>
            </p>
            <p role="status">
              {unavailable
                ? 'Routing status unavailable'
                : route.state === 'ready' &&
                    route.checked_at &&
                    now - new Date(route.checked_at).getTime() >= 300000
                  ? 'Verification expired'
                  : route.state}{' '}
              · Version {route.version}
            </p>
            {route.checked_at && (
              <p className="muted">
                Last verified: {new Date(route.checked_at).toLocaleString('en-AU')}
              </p>
            )}
            {route.error && <p className="error">{route.error}</p>}
            <div className="actions">
              {['pending', 'failed', 'withdrawn'].includes(route.state) && (
                <button disabled={busy} onClick={() => onAction(route, 'retry')}>
                  Retry route verification
                </button>
              )}
              {route.state !== 'withdrawn' && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => onAction(route, 'withdraw')}
                >
                  Withdraw route
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No service destinations are configured.</p>
      )}
      <button className="secondary" disabled={busy} onClick={onRefresh}>
        Refresh routing status
      </button>
    </section>
  );
}
