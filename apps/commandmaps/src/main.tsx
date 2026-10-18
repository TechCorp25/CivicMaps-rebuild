import { RequestComposer, type RequestDraft } from './RequestComposer';
import { RequestQueue, RequestStatus } from './RequestQueue';
import '../../../_ds/colors_and_type.css';
import { Activation } from './Activation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
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
  Radio,
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
  context_id?: string;
  municipality_id?: string;
  municipality_name?: string;
};
type Entitlements = {
  packId: string | null;
  label?: string;
  version: number | null;
  mode: string;
  capabilities: string[];
};
type Session = { actor: Actor; csrfToken: string; entitlements: Entitlements };
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
type QueuePage = { requests: Request[]; nextCursor: string | null };
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
  const [entitlement, setEntitlement] = useState<Entitlements | null>(null);
  const can = (capability: string) => entitlement?.capabilities.includes(capability) ?? false;
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<Audit[]>([]);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('active');
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const current = requests.find((request) => request.id === selected);
  const loadGeneration = useRef(0);
  const load = useCallback(
    async (preserveSelection = false) => {
      const generation = ++loadGeneration.current;
      const session = await api<Session>('/auth/session');
      if (generation !== loadGeneration.current) return;
      setEntitlement(session.entitlements);
      setCsrf(session.csrfToken);
      const capabilities = session.entitlements.capabilities;
      if (!capabilities.includes('requests.create')) setCreating(false);
      const [queue, roster] = await Promise.all([
        capabilities.includes('requests.read')
          ? (async () => {
              const allRequests: Request[] = [];
              let cursor: string | null = null;
              const status = filter === 'closed' ? 'closed' : filter === 'all' ? 'all' : 'active';
              do {
                const page: QueuePage = await api<QueuePage>(
                  `/requests?status=${status}${cursor ? `&before=${encodeURIComponent(cursor)}` : ''}`,
                );
                allRequests.push(...page.requests);
                cursor = page.nextCursor;
              } while (cursor);
              return allRequests;
            })()
          : Promise.resolve([]),
        capabilities.includes('officers.read')
          ? api<Officer[]>('/officers').catch((error) => {
              if (error instanceof ApiError && error.status === 403) return [];
              throw error;
            })
          : Promise.resolve([]),
      ]);
      if (generation !== loadGeneration.current) return;
      setRequests(queue);
      setOfficers(roster);
      if (!preserveSelection)
        setSelected((currentId) => (queue.some((r) => r.id === currentId) ? currentId : null));
    },
    [filter],
  );

  useEffect(() => {
    let active = true;
    api<Session>('/auth/session')
      .then((session) => {
        if (active) {
          setActor(session.actor);
          setCsrf(session.csrfToken);
          setEntitlement(session.entitlements);
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
    if (actor && actor.role !== 'ADMIN') void load().catch((err) => setError(err.message));
  }, [actor, load]);
  useEffect(() => {
    if (!actor || actor.role === 'ADMIN') return;
    const refresh = () => {
      void load(true).catch((err) => setError(err.message));
    };
    const timer = setInterval(refresh, 10000);
    addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      removeEventListener('focus', refresh);
    };
  }, [actor, load]);
  const currentId = current?.id;
  const currentVersion = current?.version;
  useEffect(() => {
    let active = true;
    setEvents([]);
    if (currentId)
      api<Audit[]>(`/requests/${currentId}/audit`)
        .then((data) => {
          if (active) setEvents(data);
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    return () => {
      active = false;
    };
  }, [currentId, currentVersion]);
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
        setCreating(false);
        setCsrf('');
        setRequests([]);
        setSelected(null);
      }
      if (err instanceof ApiError && [403, 409].includes(err.status)) await load().catch(() => {});
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
    await load(true);
    setSelected(result.id);
    setNotice('Saved to the operational record');
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void perform(async () => {
      await api<{ actor: Actor; csrfToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const profile = await api<Session>('/auth/session');
      setActor(profile.actor);
      setCsrf(profile.csrfToken);
      setEntitlement(profile.entitlements);
    });
  }
  function create(draft: RequestDraft) {
    void perform(async () => {
      await mutate('/requests', draft);
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
  if (actor.role === 'ADMIN')
    return (
      <main className="login">
        <section className="login-card">
          <p className="eyebrow">CivicMAPS · Council administrator</p>
          <h1>Administrator profile</h1>
          <p>{actor.name}</p>
          <p>Role: ADMIN</p>
          <p>Council: {actor.municipality_name}</p>
          <p>
            Authorised context: {actor.branch_id} · {actor.jurisdiction_id}
          </p>
          <p>
            Profile access is active. Council operations require separately approved permissions.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
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
              })
            }
          >
            Sign out
          </button>
        </section>
      </main>
    );
  return (
    <div className={`workspace ${actor.role === 'DISPATCHER' ? 'dispatch-workspace' : ''}`}>
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
          <strong>{entitlement?.label ?? actor.branch_id}</strong>
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
          <div className="dispatch-brand">
            <Radio size={24} aria-hidden="true" />
            <div>
              <span className="context">
                {actor.role === 'DISPATCHER' ? 'Dispatch' : 'CommandMAPS'}
              </span>
              <small>
                {actor.municipality_name ?? actor.tenant_id} ·{' '}
                {entitlement?.label ?? actor.branch_id}
              </small>
            </div>
          </div>
          <div className="account">
            <span>
              {actor.role === 'DISPATCHER' ? 'DISPATCH' : actor.role}
              <small>
                {actor.role === 'DISPATCHER' ? 'Coordination · ' : ''}Refreshes every 10 seconds
              </small>
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
                  ++loadGeneration.current;
                  setEntitlement(null);
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
              <p className="eyebrow">CommandMAPS · Code21 dashboard</p>
              <h1>Service requests</h1>
              <p className="muted">Assign, monitor and review requests in the current context.</p>
            </div>
            <div className="toolbar">
              <button className="secondary" disabled={busy} onClick={() => void perform(load)}>
                <RefreshCw size={18} aria-hidden="true" />
                Refresh
              </button>
              {can('requests.create') && (
                <button
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setCreating(true);
                  }}
                >
                  <Plus size={18} aria-hidden="true" />
                  New request
                </button>
              )}
            </div>
          </div>
          {entitlement?.mode === 'review' && (
            <p className="notice" role="status">
              This branch pack is disabled. You can review retained requests and audit history; new
              work is unavailable.
            </p>
          )}
          {entitlement?.mode === 'unavailable' && (
            <p className="notice" role="status">
              Operational capabilities are unavailable for this context.
            </p>
          )}
          {error && !creating && (
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
          {creating && can('requests.create') && (
            <RequestComposer
              busy={busy}
              error={error}
              onClose={() => {
                setCreating(false);
                setError('');
              }}
              onCreate={create}
            />
          )}
          <div className="queue-layout">
            <RequestQueue
              requests={requests}
              officers={officers}
              selected={selected}
              onSelect={setSelected}
              filter={filter}
              onFilter={setFilter}
            />
            <section className="panel detail" aria-label="Request detail">
              {!current ? (
                <div className="empty">
                  <MapPin size={36} aria-hidden="true" />
                  <h2>Select a request</h2>
                  <p>Review the location, assignment and audit history.</p>
                </div>
              ) : (
                <>
                  <div className="detail-heading">
                    <p className="eyebrow mono">SR-{String(current.number).padStart(7, '0')}</p>
                    <button
                      className="icon-button"
                      aria-label="Dismiss request detail"
                      onClick={() => setSelected(null)}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <h2>{current.address}</h2>
                  <RequestStatus status={current.status} />
                  <dl>
                    <dt>Coordinates</dt>
                    <dd className="mono">
                      {current.latitude}, {current.longitude}
                    </dd>
                    <dt>Assigned officer</dt>
                    <dd>
                      {officers.find((o) => o.id === current.assigned_officer_id)?.name ??
                        (current.assigned_officer_id
                          ? 'Assigned officer (directory unavailable)'
                          : 'Unassigned')}
                    </dd>
                    <dt>Dispatch notes</dt>
                    <dd>{current.notes || 'No notes recorded'}</dd>
                  </dl>
                  {can('requests.assign') &&
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
                  {can('requests.acknowledge') && current.status === 'DISPATCHED' && (
                    <button disabled={busy} onClick={() => action('acknowledge')}>
                      Acknowledge request
                    </button>
                  )}
                  {can('requests.attend') && current.status === 'ACKNOWLEDGED' && (
                    <button disabled={busy} onClick={() => action('attend')}>
                      Record attendance
                    </button>
                  )}
                  {can('requests.close') && current.status !== 'CLOSED' && (
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
        <footer>
          CivicMAPS · Synthetic development environment · Times displayed in Melbourne
        </footer>
      </div>
    </div>
  );
}
function Root() {
  const [route, setRoute] = useState(() => location.hash);
  useEffect(() => {
    const change = () => setRoute(location.hash);
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, []);
  return route.startsWith('#activate/') || route === '#activation' ? (
    <Activation key={route} />
  ) : (
    <App />
  );
}
createRoot(document.getElementById('root')!).render(<Root />);
