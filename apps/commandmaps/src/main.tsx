import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ClipboardList,
  ShieldCheck,
  MapPin,
  RefreshCw,
  LogOut,
  Plus,
  X,
  CheckCircle2,
  Clock3,
  LockKeyhole,
} from 'lucide-react';
import './tokens.css';
import './styles.css';

type Actor = {
  id: string;
  name: string;
  role: string;
  tenant_id: string;
  jurisdiction_id: string;
  branch_id: string;
};
type Request = {
  id: string;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string;
  status: string;
  assigned_officer_id: string | null;
  version: number;
  updated_at: string;
};
type Officer = { id: string; name: string };
type Audit = {
  id: string;
  action: string;
  created_at: string;
  details: { reason?: string; from?: string; to?: string };
};
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.error);
  return data;
}
const date = (value: string) =>
  new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Australia/Melbourne',
  }).format(new Date(value));
function App() {
  const [actor, setActor] = useState<Actor | null>(null);
  const [csrf, setCsrf] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<Audit[]>([]);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('active');
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const current = requests.find((request) => request.id === selected);
  async function load() {
    const [queue, roster] = await Promise.all([
      api<{ requests: Request[]; statusLabels: Record<string, string> }>('/requests'),
      api<Officer[]>('/officers'),
    ]);
    setRequests(queue.requests);
    setLabels(queue.statusLabels);
    setOfficers(roster);
  }
  useEffect(() => {
    let active = true;
    api<{ actor: Actor; csrfToken: string }>('/auth/session')
      .then((session) => {
        if (active) {
          setActor(session.actor);
          setCsrf(session.csrfToken);
        }
      })
      .catch((err) => {
        if (active && err.status !== 401) setError(err.message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (actor) void load().catch((err) => setError(err.message));
  }, [actor]);
  useEffect(() => {
    let active = true;
    setEvents([]);
    if (current)
      api<Audit[]>(`/requests/${current.id}/audit`)
        .then((data) => {
          if (active) setEvents(data);
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    return () => {
      active = false;
    };
  }, [current?.id, current?.version]);
  async function perform(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The operation could not be completed');
      if (err instanceof ApiError && err.status === 401) {
        setActor(null);
        setCsrf('');
        setRequests([]);
        setSelected(null);
      }
      if (err instanceof ApiError && err.status === 409) await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  async function mutate(path: string, input: object) {
    const payload = JSON.stringify([path, input]);
    if (retry.current?.payload !== payload) retry.current = { payload, key: crypto.randomUUID() };
    const result = await api<Request>(path, {
      method: 'POST',
      headers: { 'x-csrf-token': csrf, 'Idempotency-Key': retry.current.key },
      body: JSON.stringify(input),
    });
    retry.current = null;
    await load();
    setSelected(result.id);
    setNotice('Saved to the operational record');
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void perform(async () => {
      const session = await api<{ actor: Actor; csrfToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      setActor(session.actor);
      setCsrf(session.csrfToken);
    });
  }
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void perform(async () => {
      await mutate('/requests', {
        address: form.get('address'),
        latitude: Number(form.get('latitude')),
        longitude: Number(form.get('longitude')),
        notes: form.get('notes'),
      });
      setCreating(false);
    });
  }
  function action(action: string, extra = {}) {
    if (!current) return;
    void perform(() =>
      mutate(`/requests/${current.id}/actions`, { action, version: current.version, ...extra }),
    );
  }
  if (!ready)
    return (
      <main className="login">
        <p role="status">Loading CommandMAPS…</p>
      </main>
    );
  if (!actor)
    return (
      <main className="login">
        <section className="login-card">
          <div className="brand">
            <ShieldCheck aria-hidden="true" />
            <span>CivicMAPS</span>
          </div>
          <p className="eyebrow">CommandMAPS</p>
          <h1>Sign in to operations</h1>
          <p className="muted">Local development · synthetic accounts and records</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={login}>
            <label>
              Email
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button disabled={busy} type="submit">
              <LockKeyhole size={18} aria-hidden="true" />
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    );
  const visible = requests.filter(
    (request) =>
      filter === 'all' ||
      (filter === 'closed' ? request.status === 'CLOSED' : request.status !== 'CLOSED'),
  );
  return (
    <div className="workspace">
      <a className="skip" href="#content">
        Skip to service requests
      </a>
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck aria-hidden="true" />
          CivicMAPS
        </div>
        <p className="product">CommandMAPS</p>
        <div className="nav-item">
          <ClipboardList size={20} aria-hidden="true" />
          Service requests
        </div>
        <div className="scope">
          <p className="eyebrow">Operating context</p>
          <strong>Parking Enforcement</strong>
          <p>
            {actor.tenant_id}
            <br />
            {actor.jurisdiction_id}
          </p>
          <small>Access is restricted to this context.</small>
        </div>
        <p className="development">
          Local development
          <br />
          Synthetic data only
        </p>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="context">Dispatch coordination</span>
          <div className="account">
            <span>
              {actor.name}
              <small>{actor.role.toLowerCase()}</small>
            </span>
            <button
              className="icon-button"
              aria-label="Sign out"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await api('/auth/logout', {
                    method: 'POST',
                    headers: { 'x-csrf-token': csrf },
                    body: '{}',
                  });
                  setActor(null);
                  setCsrf('');
                  setRequests([]);
                  setSelected(null);
                  setCreating(false);
                })
              }
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main id="content">
          <div className="heading">
            <div>
              <p className="eyebrow">Code 21 · operational queue</p>
              <h1>Service requests</h1>
              <p className="muted">Assign, monitor and review requests in the current context.</p>
            </div>
            <div className="toolbar">
              <button className="secondary" disabled={busy} onClick={() => void perform(load)}>
                <RefreshCw size={18} aria-hidden="true" />
                Refresh
              </button>
              {actor.role === 'DISPATCHER' && (
                <button disabled={busy} onClick={() => setCreating(true)}>
                  <Plus size={18} aria-hidden="true" />
                  New request
                </button>
              )}
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice" role="status">
              <CheckCircle2 size={18} aria-hidden="true" />
              {notice}
            </p>
          )}
          <div className="stats">
            <section>
              <span>Active requests</span>
              <strong>{requests.filter((r) => r.status !== 'CLOSED').length}</strong>
            </section>
            <section>
              <span>Awaiting acknowledgement</span>
              <strong>{requests.filter((r) => r.status === 'DISPATCHED').length}</strong>
            </section>
            <section>
              <span>Attended</span>
              <strong>{requests.filter((r) => r.status === 'ATTENDED').length}</strong>
            </section>
          </div>
          {creating && (
            <section className="panel create-panel">
              <div className="panel-heading">
                <h2>New service request</h2>
                <button
                  className="icon-button"
                  aria-label="Dismiss new request"
                  disabled={busy}
                  onClick={() => setCreating(false)}
                >
                  <X />
                </button>
              </div>
              <form onSubmit={create}>
                <label>
                  Location or address
                  <input
                    name="address"
                    required
                    maxLength={250}
                    placeholder="Enter the reported location"
                  />
                </label>
                <div className="coordinate-fields">
                  <label>
                    Latitude
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      defaultValue="-37.814"
                      required
                    />
                  </label>
                  <label>
                    Longitude
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      defaultValue="144.963"
                      required
                    />
                  </label>
                </div>
                <label>
                  Dispatch notes
                  <textarea name="notes" maxLength={2000} rows={3} />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Create request'}
                </button>
              </form>
            </section>
          )}
          <div className="queue-layout">
            <section className="panel queue">
              <div className="panel-heading">
                <h2>Operational queue</h2>
                <label className="filter">
                  Show
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="all">All requests</option>
                  </select>
                </label>
              </div>
              {visible.length === 0 ? (
                <div className="empty">
                  <ClipboardList size={36} aria-hidden="true" />
                  <h3>No {filter === 'all' ? '' : filter + ' '}requests</h3>
                  <p>Requests appear here after they are saved or assigned.</p>
                </div>
              ) : (
                <ul className="request-list">
                  {visible.map((request) => (
                    <li key={request.id}>
                      <button
                        className={`request-row ${selected === request.id ? 'selected' : ''}`}
                        onClick={() => setSelected(request.id)}
                        aria-pressed={selected === request.id}
                      >
                        <div>
                          <span className="mono">SR-{String(request.number).padStart(7, '0')}</span>
                          <span className={`status status-${request.status.toLowerCase()}`}>
                            <Clock3 size={14} aria-hidden="true" />
                            {labels[request.status]}
                          </span>
                        </div>
                        <strong>{request.address}</strong>
                        <span className="muted">
                          {officers.find((o) => o.id === request.assigned_officer_id)?.name ??
                            'Unassigned'}
                        </span>
                        <small>Updated {date(request.updated_at)}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="panel detail" aria-label="Request detail">
              {!current ? (
                <div className="empty">
                  <MapPin size={36} aria-hidden="true" />
                  <h2>Select a request</h2>
                  <p>Review the location, assignment and audit history.</p>
                </div>
              ) : (
                <>
                  <p className="eyebrow mono">SR-{String(current.number).padStart(7, '0')}</p>
                  <h2>{current.address}</h2>
                  <p className={`status status-${current.status.toLowerCase()}`}>
                    <Clock3 size={16} aria-hidden="true" />
                    {labels[current.status]}
                  </p>
                  <dl>
                    <dt>Coordinates</dt>
                    <dd className="mono">
                      {current.latitude}, {current.longitude}
                    </dd>
                    <dt>Assigned officer</dt>
                    <dd>
                      {officers.find((o) => o.id === current.assigned_officer_id)?.name ??
                        'Unassigned'}
                    </dd>
                    <dt>Dispatch notes</dt>
                    <dd>{current.notes || 'No notes recorded'}</dd>
                  </dl>
                  {actor.role === 'DISPATCHER' &&
                    ['RECEIVED', 'DISPATCHED'].includes(current.status) && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          action('assign', {
                            officerId: new FormData(e.currentTarget).get('officerId'),
                          });
                        }}
                      >
                        <label>
                          Assign officer
                          <select
                            name="officerId"
                            required
                            defaultValue={current.assigned_officer_id ?? ''}
                            key={`${current.id}-${current.version}`}
                          >
                            <option value="" disabled>
                              Select officer
                            </option>
                            {officers.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button type="submit" disabled={busy}>
                          Assign request
                        </button>
                      </form>
                    )}
                  {actor.role === 'OFFICER' && current.status === 'DISPATCHED' && (
                    <button disabled={busy} onClick={() => action('acknowledge')}>
                      Acknowledge request
                    </button>
                  )}
                  {actor.role === 'OFFICER' && current.status === 'ACKNOWLEDGED' && (
                    <button disabled={busy} onClick={() => action('attend')}>
                      Record attendance
                    </button>
                  )}
                  {actor.role === 'DISPATCHER' && current.status !== 'CLOSED' && (
                    <form
                      className="close-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        action('close', { reason: new FormData(e.currentTarget).get('reason') });
                      }}
                    >
                      <label>
                        Closure reason
                        <input name="reason" maxLength={1000} required />
                      </label>
                      <button type="submit" className="secondary" disabled={busy}>
                        Close request
                      </button>
                    </form>
                  )}
                  {actor.role === 'SUPERVISOR' && (
                    <p className="muted">
                      <LockKeyhole size={16} aria-hidden="true" />
                      Read-only review access
                    </p>
                  )}
                  <div className="audit">
                    <h3>Audit history</h3>
                    <ol>
                      {events.map((event) => (
                        <li key={event.id}>
                          <strong>{event.action}</strong>
                          <time dateTime={event.created_at}>{date(event.created_at)}</time>
                          {event.details.reason && <p>{event.details.reason}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
        <footer>CivicMAPS · Local foundation build · Times displayed in Melbourne</footer>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
