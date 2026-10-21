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
  actor_id: string;
  action: string;
  created_at: string;
  details: { reason?: string; from?: string; to?: string };
};
type QueuePage = { requests: Request[]; nextCursor: string | null };
type AuditState = {
  requestId: string;
  scopeKey: string;
  status: 'loading' | 'ready' | 'unavailable';
  events: Audit[];
  error?: string;
};
type RecoveryAction = {
  requestId: string;
  action: string;
  version: number;
  input: Record<string, unknown>;
  key: string | null;
  kind: 'rejected' | 'conflict' | 'uncertain' | 'reconciled';
  message: string;
  latestVersion?: number;
  retrySameAction?: boolean;
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
  const [entitlement, setEntitlement] = useState<Entitlements | null>(null);
  const can = (capability: string) => entitlement?.capabilities.includes(capability) ?? false;
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [queueState, setQueueState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [queueError, setQueueError] = useState('');
  const [queueCheckedAt, setQueueCheckedAt] = useState<string | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [auditState, setAuditState] = useState<AuditState | null>(null);
  const [actionRecoveries, setActionRecoveries] = useState<Record<string, RecoveryAction>>({});
  const [assignmentDraft, setAssignmentDraft] = useState('');
  const [closureReasonDraft, setClosureReasonDraft] = useState('');
  const assignmentDraftDirty = useRef(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('active');
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const pending = useRef(false);
  const hasQueueSnapshot = useRef(false);
  const scopeGeneration = useRef(0);
  const activeScope = useRef<string | null>(null);
  const current = requests.find((request) => request.id === selected);
  const currentId = current?.id;
  const currentVersion = current?.version;
  const actionRecovery = currentId ? actionRecoveries[currentId] : undefined;
  const scopeKey = actor
    ? `${actor.id}:${actor.context_id ?? ''}:${actor.tenant_id}:${actor.jurisdiction_id}:${actor.branch_id}:${entitlement?.version ?? ''}`
    : '';
  const loadGeneration = useRef(0);
  function updateActionRecovery(requestId: string, recovery: RecoveryAction | null) {
    setActionRecoveries((existing) => {
      const next = { ...existing };
      if (recovery) next[requestId] = recovery;
      else delete next[requestId];
      return next;
    });
  }
  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    if (!hasQueueSnapshot.current) setQueueState('loading');
    setQueueError('');
    try {
      const session = await api<Session>('/auth/session');
      if (generation !== loadGeneration.current) return null;
      const nextScope = `${session.actor.id}:${session.actor.context_id ?? ''}:${session.actor.tenant_id}:${session.actor.jurisdiction_id}:${session.actor.branch_id}:${session.entitlements.version ?? ''}`;
      if (activeScope.current && activeScope.current !== nextScope) {
        ++scopeGeneration.current;
        hasQueueSnapshot.current = false;
        setQueueState('loading');
        setRequests([]);
        setOfficers([]);
        selectedRef.current = null;
        setSelected(null);
        setAuditState(null);
        setActionRecoveries({});
        setQueueCheckedAt(null);
        setActor(session.actor);
        retry.current = null;
      }
      activeScope.current = nextScope;
      setEntitlement(session.entitlements);
      setCsrf(session.csrfToken);
      const capabilities = session.entitlements.capabilities;
      if (!capabilities.includes('requests.create')) setCreating(false);
      const [queue, roster] = await Promise.all([
        capabilities.includes('requests.read')
          ? (async () => {
              const allRequests: Request[] = [];
              let cursor: string | null = null;
              do {
                const page: QueuePage = await api<QueuePage>(
                  `/requests?status=all${cursor ? `&before=${encodeURIComponent(cursor)}` : ''}`,
                );
                allRequests.push(...page.requests);
                cursor = page.nextCursor;
                if (generation !== loadGeneration.current) return [];
              } while (cursor);
              return allRequests;
            })()
          : Promise.resolve([] as Request[]),
        capabilities.includes('officers.read')
          ? api<Officer[]>('/officers').catch((error) => {
              if (error instanceof ApiError && error.status === 403) return [];
              throw error;
            })
          : Promise.resolve([]),
      ]);
      if (generation !== loadGeneration.current) return null;
      setRequests(queue);
      setOfficers(roster);
      hasQueueSnapshot.current = true;
      setQueueState('ready');
      setQueueCheckedAt(new Date().toISOString());
      return queue;
    } catch (err) {
      if (generation === loadGeneration.current) {
        if (err instanceof ApiError && err.status === 401) {
          ++loadGeneration.current;
          ++scopeGeneration.current;
          hasQueueSnapshot.current = false;
          activeScope.current = null;
          setActor(null);
          setCsrf('');
          setEntitlement(null);
          setRequests([]);
          setOfficers([]);
          selectedRef.current = null;
          setSelected(null);
          setAuditState(null);
          setActionRecoveries({});
          setQueueCheckedAt(null);
          setQueueState('unavailable');
        } else {
          setQueueState('unavailable');
          setQueueError(err instanceof Error ? err.message : 'Requests could not be refreshed.');
        }
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;
    api<Session>('/auth/session')
      .then((session) => {
        if (active) {
          activeScope.current = `${session.actor.id}:${session.actor.context_id ?? ''}:${session.actor.tenant_id}:${session.actor.jurisdiction_id}:${session.actor.branch_id}:${session.entitlements.version ?? ''}`;
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
    if (actor && actor.role !== 'ADMIN') void load().catch(() => {});
  }, [actor, load]);
  useEffect(() => {
    if (!actor || actor.role === 'ADMIN') return;
    const refresh = () => {
      void load().catch(() => {});
    };
    const timer = setInterval(refresh, 10000);
    addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      removeEventListener('focus', refresh);
    };
  }, [actor, load]);
  useEffect(() => {
    let active = true;
    const generation = scopeGeneration.current;
    if (!actor || !currentId) {
      setAuditState(null);
      return () => {
        active = false;
      };
    }
    setAuditState({ requestId: currentId, scopeKey, status: 'loading', events: [] });
    api<Audit[]>(`/requests/${currentId}/audit`)
      .then((data) => {
        if (active && generation === scopeGeneration.current)
          setAuditState({ requestId: currentId, scopeKey, status: 'ready', events: data });
      })
      .catch((err) => {
        if (!active || generation !== scopeGeneration.current) return;
        if (err instanceof ApiError && err.status === 401) {
          ++loadGeneration.current;
          ++scopeGeneration.current;
          hasQueueSnapshot.current = false;
          activeScope.current = null;
          setActor(null);
          setCsrf('');
          setEntitlement(null);
          setRequests([]);
          setOfficers([]);
          selectedRef.current = null;
          setSelected(null);
          setAuditState(null);
          setActionRecoveries({});
          setQueueCheckedAt(null);
          setQueueState('unavailable');
          return;
        }
        setAuditState({
          requestId: currentId,
          scopeKey,
          status: 'unavailable',
          events: [],
          error: err instanceof Error ? err.message : 'History could not be loaded.',
        });
      });
    return () => {
      active = false;
    };
  }, [actor, currentId, currentVersion, scopeKey]);
  useEffect(() => {
    if (current && !assignmentDraftDirty.current)
      setAssignmentDraft(current.assigned_officer_id ?? '');
  }, [current, currentId, currentVersion, current?.assigned_officer_id]);
  function selectRequest(id: string) {
    selectedRef.current = id;
    setSelected(id);
    assignmentDraftDirty.current = false;
    setAssignmentDraft(requests.find((request) => request.id === id)?.assigned_officer_id ?? '');
    setClosureReasonDraft('');
  }
  async function perform(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The operation could not be completed');
      if (err instanceof ApiError && err.status === 401) {
        ++loadGeneration.current;
        ++scopeGeneration.current;
        hasQueueSnapshot.current = false;
        activeScope.current = null;
        setActor(null);
        setCreating(false);
        setCsrf('');
        setEntitlement(null);
        setRequests([]);
        setOfficers([]);
        selectedRef.current = null;
        setSelected(null);
        setAuditState(null);
        setActionRecoveries({});
        setQueueCheckedAt(null);
        setQueueState('unavailable');
      }
      if (err instanceof ApiError && [403, 409].includes(err.status)) await load().catch(() => {});
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function mutate(
    path: string,
    input: object,
    expectedScope = scopeGeneration.current,
    idempotencyKey?: string,
  ) {
    const payload = JSON.stringify([path, input]);
    if (!idempotencyKey && retry.current?.payload !== payload)
      retry.current = { payload, key: crypto.randomUUID() };
    const key = idempotencyKey ?? retry.current!.key;
    const result = await api<Request>(path, {
      method: 'POST',
      headers: { 'x-csrf-token': csrf, 'Idempotency-Key': key },
      body: JSON.stringify(input),
    });
    if (retry.current?.key === key) retry.current = null;
    if (expectedScope !== scopeGeneration.current) return result;
    setRequests((existing) => {
      const index = existing.findIndex((request) => request.id === result.id);
      if (index < 0) return path === '/requests' ? [result, ...existing].slice(0, 100) : existing;
      return existing.map((request) => (request.id === result.id ? result : request));
    });
    if (path === '/requests') {
      selectedRef.current = result.id;
      setSelected(result.id);
    }
    await load().catch(() => {});
    setNotice('Saved to the operational record');
    return result;
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
      activeScope.current = `${profile.actor.id}:${profile.actor.context_id ?? ''}:${profile.actor.tenant_id}:${profile.actor.jurisdiction_id}:${profile.actor.branch_id}:${profile.entitlements.version ?? ''}`;
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
    const requestId = current.id;
    const version = current.version;
    const generation = scopeGeneration.current;
    const input = { action, version, ...extra };
    void perform(async () => {
      try {
        const result = await mutate(`/requests/${requestId}/actions`, input, generation);
        if (generation !== scopeGeneration.current) return;
        updateActionRecovery(requestId, null);
        if (selectedRef.current === requestId) {
          if (action === 'close') setClosureReasonDraft('');
          if (action === 'assign') {
            assignmentDraftDirty.current = false;
            setAssignmentDraft(result.assigned_officer_id ?? '');
          }
        }
      } catch (err) {
        if (generation !== scopeGeneration.current) throw err;
        const payload = JSON.stringify([`/requests/${requestId}/actions`, input]);
        const key = retry.current?.payload === payload ? retry.current.key : null;
        const kind =
          err instanceof ApiError && err.status === 409
            ? 'conflict'
            : err instanceof ApiError && err.status < 500
              ? 'rejected'
              : 'uncertain';
        const message =
          kind === 'conflict'
            ? 'The request changed before this action was accepted. The latest server state is being loaded; review it before choosing an action.'
            : kind === 'uncertain'
              ? 'The service did not confirm whether this action completed. No write will be replayed automatically. Check the server state and history before continuing.'
              : err instanceof Error
                ? err.message
                : 'The action was rejected. Review the request and try again.';
        updateActionRecovery(requestId, { requestId, action, version, input, key, kind, message });
        throw err;
      }
    });
  }
  async function reconcileAction() {
    if (!actionRecovery || actionRecovery.kind !== 'uncertain') return;
    const recovery = actionRecovery;
    const generation = scopeGeneration.current;
    await perform(async () => {
      const refreshed = await load();
      if (!refreshed || generation !== scopeGeneration.current) return;
      const latest = refreshed.find((request) => request.id === recovery.requestId);
      if (!latest) {
        updateActionRecovery(recovery.requestId, {
          ...recovery,
          kind: 'reconciled',
          message:
            'The request is not present in the latest authorised queue snapshot. Choose another request or refresh the queue; this action has not been replayed.',
          retrySameAction: false,
        });
        return;
      }
      const history = await api<Audit[]>(`/requests/${recovery.requestId}/audit`);
      if (generation !== scopeGeneration.current) return;
      if (selectedRef.current === recovery.requestId)
        setAuditState({
          requestId: recovery.requestId,
          scopeKey,
          status: 'ready',
          events: history,
        });
      const unchanged = latest.version === recovery.version;
      updateActionRecovery(recovery.requestId, {
        ...recovery,
        kind: 'reconciled',
        latestVersion: latest.version,
        retrySameAction: unchanged && recovery.key !== null,
        message: unchanged
          ? `Server state and history were refreshed. The request remains at version ${latest.version}. Review it before choosing whether to retry the same action.`
          : `Server state and history were refreshed. The request is now at version ${latest.version}; the earlier action will not be replayed. Review the confirmed state before choosing another available action.`,
      });
    });
  }
  function retrySameAction() {
    if (!actionRecovery?.retrySameAction || !current || actionRecovery.requestId !== current.id)
      return;
    const recovery = actionRecovery;
    const generation = scopeGeneration.current;
    void perform(async () => {
      try {
        await mutate(
          `/requests/${recovery.requestId}/actions`,
          recovery.input,
          generation,
          recovery.key ?? undefined,
        );
        if (generation !== scopeGeneration.current) return;
        updateActionRecovery(recovery.requestId, null);
      } catch (err) {
        if (generation !== scopeGeneration.current) throw err;
        const kind =
          err instanceof ApiError && err.status === 409
            ? 'conflict'
            : err instanceof ApiError && err.status < 500
              ? 'rejected'
              : 'uncertain';
        updateActionRecovery(recovery.requestId, {
          ...recovery,
          kind,
          retrySameAction: false,
          message:
            kind === 'uncertain'
              ? 'The retry response is also uncertain. Refresh server state and history before continuing.'
              : err instanceof Error
                ? err.message
                : 'The action was rejected. Review the latest request state.',
        });
        throw err;
      }
    });
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
                  ++scopeGeneration.current;
                  hasQueueSnapshot.current = false;
                  activeScope.current = null;
                  setEntitlement(null);
                  setActor(null);
                  setCsrf('');
                  setRequests([]);
                  setOfficers([]);
                  setSelected(null);
                  selectedRef.current = null;
                  setAuditState(null);
                  setActionRecoveries({});
                  setQueueCheckedAt(null);
                  setQueueState('unavailable');
                  retry.current = null;
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
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void load().catch(() => {})}
              >
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
          {queueState === 'loading' && (
            <p className="notice" role="status">
              Loading requests from the current context…
            </p>
          )}
          {queueState === 'unavailable' && (
            <p className="error" role="alert">
              {hasQueueSnapshot.current && queueCheckedAt
                ? `Refresh failed. Showing the last confirmed queue from ${date(queueCheckedAt)}. `
                : 'Requests are unavailable for the current session. '}
              {queueError || 'Sign in again or retry the refresh.'}
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void load().catch(() => {})}
              >
                Retry refresh
              </button>
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
              onSelect={selectRequest}
              filter={filter}
              onFilter={setFilter}
            />
            <section className="panel detail" aria-labelledby="detail-title">
              {!current ? (
                <div className="empty">
                  <MapPin size={36} aria-hidden="true" />
                  {selected ? (
                    <>
                      <h2 id="detail-title">Selected request unavailable</h2>
                      <p>
                        This request is not present in the latest authorised queue snapshot. It may
                        have left the disclosed latest-100 results or be unavailable in this
                        context.
                      </p>
                      <button
                        className="secondary"
                        onClick={() => {
                          selectedRef.current = null;
                          setSelected(null);
                        }}
                      >
                        Return to queue
                      </button>
                    </>
                  ) : queueState === 'loading' ? (
                    <>
                      <h2 id="detail-title">Loading requests</h2>
                      <p>The current context is being refreshed from the service.</p>
                    </>
                  ) : (
                    <>
                      <h2 id="detail-title">Select a request</h2>
                      <p>Review its confirmed status, assignment and read-only history.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="detail-heading">
                    <p className="eyebrow mono">SR-{String(current.number).padStart(7, '0')}</p>
                    <button
                      className="icon-button"
                      aria-label="Dismiss request detail"
                      onClick={() => {
                        const requestId = current.id;
                        selectedRef.current = null;
                        setSelected(null);
                        requestAnimationFrame(() => {
                          const row = document.querySelector<HTMLElement>(
                            `[data-request-id="${requestId}"] .request-link`,
                          );
                          (row ?? document.querySelector<HTMLElement>('.queue-scroll'))?.focus();
                        });
                      }}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <h2 id="detail-title">{current.address}</h2>
                  <RequestStatus status={current.status} />
                  <p className="detail-confirmation" role="status">
                    Server-confirmed version <span className="mono">{current.version}</span> ·
                    request updated {date(current.updated_at)}
                    {queueCheckedAt && <> · queue checked {date(queueCheckedAt)}</>}
                  </p>
                  {actionRecovery?.requestId === current.id && (
                    <div
                      className={actionRecovery.kind === 'reconciled' ? 'notice' : 'error'}
                      role={actionRecovery.kind === 'reconciled' ? 'status' : 'alert'}
                    >
                      <span>{actionRecovery.message}</span>
                      {actionRecovery.kind === 'uncertain' && (
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => void reconcileAction()}
                        >
                          Check server state and history
                        </button>
                      )}
                      {actionRecovery.kind === 'reconciled' && actionRecovery.retrySameAction && (
                        <button className="secondary" disabled={busy} onClick={retrySameAction}>
                          Retry the same action
                        </button>
                      )}
                    </div>
                  )}
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
                            value={assignmentDraft}
                            onChange={(event) => {
                              assignmentDraftDirty.current = true;
                              setAssignmentDraft(event.target.value);
                            }}
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
                        <button
                          type="submit"
                          disabled={
                            busy ||
                            (actionRecovery?.requestId === current.id &&
                              actionRecovery.kind === 'uncertain')
                          }
                        >
                          Assign request
                        </button>
                      </form>
                    )}
                  {can('requests.acknowledge') && current.status === 'DISPATCHED' && (
                    <button
                      disabled={
                        busy ||
                        (actionRecovery?.requestId === current.id &&
                          actionRecovery.kind === 'uncertain')
                      }
                      onClick={() => action('acknowledge')}
                    >
                      Acknowledge request
                    </button>
                  )}
                  {can('requests.attend') && current.status === 'ACKNOWLEDGED' && (
                    <button
                      disabled={
                        busy ||
                        (actionRecovery?.requestId === current.id &&
                          actionRecovery.kind === 'uncertain')
                      }
                      onClick={() => action('attend')}
                    >
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
                        <input
                          name="reason"
                          maxLength={1000}
                          required
                          value={closureReasonDraft}
                          onChange={(event) => setClosureReasonDraft(event.target.value)}
                        />
                      </label>
                      <button
                        type="submit"
                        className="secondary"
                        disabled={
                          busy ||
                          (actionRecovery?.requestId === current.id &&
                            actionRecovery.kind === 'uncertain')
                        }
                      >
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
                    {auditState?.requestId !== current.id ||
                    auditState.scopeKey !== scopeKey ||
                    auditState.status === 'loading' ? (
                      <p role="status">Loading history for this request…</p>
                    ) : auditState.status === 'unavailable' ? (
                      <div className="error" role="alert">
                        <p>
                          History is unavailable for this request. Request state remains
                          server-confirmed.
                        </p>
                        <p>{auditState.error}</p>
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => {
                            const requestId = current.id;
                            const requestScope = scopeKey;
                            const generation = scopeGeneration.current;
                            setAuditState({
                              requestId,
                              scopeKey: requestScope,
                              status: 'loading',
                              events: [],
                            });
                            void api<Audit[]>(`/requests/${requestId}/audit`)
                              .then((events) => {
                                if (
                                  generation === scopeGeneration.current &&
                                  selectedRef.current === requestId
                                )
                                  setAuditState({
                                    requestId,
                                    scopeKey: requestScope,
                                    status: 'ready',
                                    events,
                                  });
                              })
                              .catch((err: unknown) => {
                                if (
                                  generation !== scopeGeneration.current ||
                                  selectedRef.current !== requestId
                                )
                                  return;
                                if (err instanceof ApiError && err.status === 401) {
                                  ++loadGeneration.current;
                                  ++scopeGeneration.current;
                                  hasQueueSnapshot.current = false;
                                  activeScope.current = null;
                                  selectedRef.current = null;
                                  setActor(null);
                                  setCsrf('');
                                  setEntitlement(null);
                                  setRequests([]);
                                  setOfficers([]);
                                  setSelected(null);
                                  setAuditState(null);
                                  setActionRecoveries({});
                                  setQueueCheckedAt(null);
                                  setQueueState('unavailable');
                                  return;
                                }
                                setAuditState({
                                  requestId,
                                  scopeKey: requestScope,
                                  status: 'unavailable',
                                  events: [],
                                  error:
                                    err instanceof Error
                                      ? err.message
                                      : 'History could not be loaded.',
                                });
                              });
                          }}
                        >
                          Retry history
                        </button>
                      </div>
                    ) : auditState.events.length === 0 ? (
                      <p>No history has been recorded for this request.</p>
                    ) : (
                      <ol>
                        {auditState.events.map((event) => (
                          <li key={event.id}>
                            <strong>{event.action}</strong>
                            <time dateTime={event.created_at}>{date(event.created_at)}</time>
                            {event.details.from && event.details.to && (
                              <p>
                                {event.details.from} → {event.details.to}
                              </p>
                            )}
                            {event.details.reason && <p>{event.details.reason}</p>}
                          </li>
                        ))}
                      </ol>
                    )}
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
