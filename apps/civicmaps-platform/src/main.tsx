import { useEffect, useCallback, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Layers3,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  ChevronDown,
} from 'lucide-react';
import {
  api,
  ApiError,
  date,
  number,
  type Actor,
  type Municipality,
  type PackOption,
  type Detail,
  type Onboarding as Input,
  type ProvisionResult,
} from './api';
import { Badge, Brand, Boundary, Confirm } from './components';
import { PackAssignments } from './PackAssignments';
import { Onboarding } from './Onboarding';
import { ProvisioningStatus } from './ProvisioningStatus';
import { AdminActivation } from './AdminActivation';
import { RoutingStatus } from './RoutingStatus';
import './tokens.css';
import './styles.css';

type Page = 'municipalities' | 'packs' | 'health' | 'onboarding';
type Route = { page: Page; id: string | null };
function readRoute(): Route {
  const [page, id] = location.hash.slice(1).split('/');
  return {
    page: ['municipalities', 'packs', 'health', 'onboarding'].includes(page)
      ? (page as Page)
      : 'municipalities',
    id: id || null,
  };
}
function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [actor, setActor] = useState<Actor | null>(null);
  const [csrf, setCsrf] = useState('');
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [catalogue, setCatalogue] = useState<PackOption[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [detailRefresh, setDetailRefresh] = useState(0);
  const [detailError, setDetailError] = useState('');
  const detailScope = useRef(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState<{
    key: 'name' | 'status' | 'officers_online' | 'code21_7d' | 'health';
    descending: boolean;
  }>({ key: 'name', descending: false });
  const packLabel = (id: string) => catalogue.find((pack) => pack.id === id)?.label ?? id;
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [provisioned, setProvisioned] = useState<ProvisionResult | null>(null);
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const content = useRef<HTMLElement>(null);
  const current = municipalities.find((m) => m.id === route.id);
  function navigate(page: Page, id: string | null = null) {
    location.hash = `${page}${id ? `/${id}` : ''}`;
  }
  const clearSession = useCallback(() => {
    detailScope.current += 1;
    setActor(null);
    setCsrf('');
    setMunicipalities([]);
    setDetail(null);
    setLoaded(false);
    setProvisioned(null);
    setConfirmation(null);
    retry.current = null;
  }, []);
  const fail = useCallback(
    (err: unknown) => {
      setError(err instanceof Error ? err.message : 'The operation could not be completed');
      if (err instanceof ApiError && err.status === 401) clearSession();
    },
    [clearSession],
  );
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
    function change() {
      detailScope.current += 1;
      setRoute(readRoute());
      setDetail(null);
      setDetailError('');
      setError('');
      setNotice('');
      setConfirmation(null);
      setProvisioned(null);
    }
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    content.current?.focus();
  }, [route.page, route.id]);
  async function load() {
    const result = await api<{
      municipalities: Municipality[];
      domainPacks: string[];
      packCatalogue: PackOption[];
    }>('/municipalities');
    setMunicipalities(result.municipalities);
    setCatalogue(result.packCatalogue);
    setLoaded(true);
  }
  useEffect(() => {
    if (!actor) return;
    const controller = new AbortController();
    api<{ municipalities: Municipality[]; domainPacks: string[]; packCatalogue: PackOption[] }>(
      '/municipalities',
      {
        signal: controller.signal,
      },
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setMunicipalities(result.municipalities);
          setCatalogue(result.packCatalogue);
          setLoaded(true);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) fail(err);
      });
    return () => controller.abort();
  }, [actor, fail]);
  useEffect(() => {
    if (!actor || !route.id) return;
    const controller = new AbortController();
    setDetailError('');
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function refresh() {
      try {
        const result = await api<Detail>(`/municipalities/${route.id}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (!controller.signal.aborted) {
          setDetail(result);
          setDetailError('');
          timer = setTimeout(
            refresh,
            (result.job && ['queued', 'running', 'waiting'].includes(result.job.state)) ||
              result.routes?.some((r) => ['pending', 'running'].includes(r.state))
              ? 2000
              : 15000,
          );
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setDetailError(err instanceof Error ? err.message : 'Status refresh unavailable');
          if (err instanceof ApiError && err.status === 401) fail(err);
          timer = setTimeout(refresh, 15000);
        }
      }
    }
    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // Page changes clear detail even when the municipality ID stays the same (F02).
  }, [actor, route.page, route.id, current?.version, detailRefresh, fail]);
  async function perform(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (err) {
      fail(err);
      if (err instanceof ApiError && err.status === 409) await load().catch(fail);
    } finally {
      setBusy(false);
    }
  }
  async function mutate<T>(path: string, data: object) {
    const payload = JSON.stringify([path, data]);
    if (retry.current?.payload !== payload) retry.current = { payload, key: crypto.randomUUID() };
    const result = await api<T>(path, {
      method: 'POST',
      headers: { 'x-csrf-token': csrf, 'Idempotency-Key': retry.current.key },
      body: JSON.stringify(data),
    });
    retry.current = null;
    return result;
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void perform(async () => {
      const session = await api<{ actor: Actor; csrfToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      setActor(session.actor);
      setCsrf(session.csrfToken);
    });
  }
  function register(data: Input) {
    void perform(async () => {
      const result = await mutate<ProvisionResult>('/municipalities', data);
      setProvisioned(result);
      await load();
    });
  }
  function toggle(pack: string, enabled: boolean) {
    if (!current) return;
    void perform(async () => {
      await mutate(`/municipalities/${current.id}/packs`, {
        pack,
        enabled,
        version: current.version,
        confirmed: !enabled,
      });
      setConfirmation(null);
      await load();
      setNotice(
        `${packLabel(pack)} ${enabled ? 'enabled' : 'disabled'}. Configuration saved; existing records retained.`,
      );
    });
  }
  function refreshJob(action?: 'retry' | 'reconcile') {
    if (!current) return;
    // One effect owns detail reads; each refresh restarts polling even if state is unchanged.
    if (!action) {
      setError('');
      setNotice('');
      setDetailRefresh((value) => value + 1);
      return;
    }
    const scope = detailScope.current;
    void perform(async () => {
      try {
        if (detail?.job)
          await mutate(`/municipalities/${current.id}/jobs/${detail.job.id}/actions`, { action });
      } catch (err) {
        // A completed mutation may belong to a council or session that has been left.
        if (scope !== detailScope.current) return;
        throw err;
      }
      if (scope !== detailScope.current) return;
      setDetailRefresh((value) => value + 1);
      setNotice(`Job ${action} requested. Completed steps are retained.`);
    });
  }
  function changeSort(key: typeof sort.key) {
    setSort({ key, descending: sort.key === key ? !sort.descending : false });
  }
  const filtered = municipalities
    .filter(
      (m) =>
        (status === 'All' || m.status === status) &&
        `${m.name} ${m.slug}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const first = a[sort.key],
        second = b[sort.key];
      const result =
        typeof first === 'number' || typeof second === 'number'
          ? Number(first ?? -1) - Number(second ?? -1)
          : String(first ?? '').localeCompare(String(second ?? ''));
      return sort.descending ? -result : result;
    });
  if (!ready)
    return (
      <main className="login">
        <p role="status">Loading CivicMAPS Platform…</p>
      </main>
    );
  if (!actor)
    return (
      <main className="login">
        <section className="login-card">
          <Brand />
          <p className="eyebrow">Ecosystem management</p>
          <h1>Sign in to Platform</h1>
          <p className="muted">For platform operators managing the CivicMAPS network.</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={login}>
            <label>
              Platform operator email
              <input name="email" type="email" required autoComplete="username" />
            </label>
            <label>
              Password
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
            <button disabled={busy} type="submit">
              <ShieldCheck size={18} aria-hidden="true" />
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="local-note">Development · Synthetic councils and accounts</p>
        </section>
      </main>
    );
  return (
    <div className="workspace">
      <a className="skip" href="#content">
        Skip to main content
      </a>
      <header className="topbar">
        <Brand />
        <span className="context">No council context</span>
        <div className="operator">
          <span className="avatar" aria-hidden="true">
            SI
          </span>
          <span>
            {actor.name}
            <small>Platform operator</small>
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
                clearSession();
              })
            }
          >
            <LogOut size={19} aria-hidden="true" />
          </button>
        </div>
      </header>
      <nav className="rail" aria-label="Platform navigation">
        <span className="rail-mark" aria-hidden="true">
          C
        </span>
        {(
          [
            { page: 'municipalities', label: 'Municipalities', icon: Building2 },
            { page: 'packs', label: 'Domain packs', icon: Layers3 },
            { page: 'health', label: 'Network health', icon: Activity },
          ] as const
        ).map((item) => (
          <a
            key={item.page}
            href={`#${item.page}`}
            className={
              route.page === item.page ||
              (route.page === 'onboarding' && item.page === 'municipalities')
                ? 'selected'
                : ''
            }
            aria-current={route.page === item.page ? 'page' : undefined}
            title={item.label}
          >
            <item.icon size={21} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        ))}
        <span className="rail-bottom">
          <ShieldCheck size={20} aria-hidden="true" />
          Control plane
        </span>
      </nav>
      <main id="content" tabIndex={-1} ref={content}>
        <div className="environment">
          <span className="environment-dot" aria-hidden="true" />
          Development<span>Synthetic data · Metrics are illustrative snapshots</span>
        </div>
        {(error || detailError) && (
          <p className="error" role="alert">
            {error || detailError}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {!loaded ? (
          <div className="card">
            <p role="status">Loading municipality directory…</p>
            <button disabled={busy} onClick={() => void perform(load)}>
              Retry loading
            </button>
          </div>
        ) : route.page === 'onboarding' ? (
          <Onboarding
            catalogue={catalogue}
            busy={busy}
            result={provisioned}
            onSubmit={register}
            onCancel={() => navigate('municipalities')}
            onView={(id) => navigate('municipalities', id)}
          />
        ) : route.id ? (
          !current ? (
            <section className="card">
              <h1>Municipality unavailable</h1>
              <p>The record could not be loaded.</p>
              <button onClick={() => navigate(route.page)}>Back to directory</button>
            </section>
          ) : (
            <>
              <button className="text-button" onClick={() => navigate(route.page)}>
                <ArrowLeft size={16} aria-hidden="true" />
                {route.page === 'health'
                  ? 'Network health'
                  : route.page === 'packs'
                    ? 'Domain packs'
                    : 'Municipalities'}
              </button>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {route.page === 'health'
                      ? 'Council health'
                      : route.page === 'packs'
                        ? 'Capability configuration'
                        : 'Municipality overview'}
                  </p>
                  <h1>{current.name}</h1>
                  <p>
                    {detail?.routes?.find((item) => item.service === 'commandmaps')?.hostname ??
                      current.slug}{' '}
                    · Registry ID: <code>{current.id}</code>
                  </p>
                </div>
                <Badge value={route.page === 'health' ? current.health : current.status} />
              </div>
              {route.page === 'packs' ? (
                <PackAssignments
                  catalogue={catalogue}
                  selected={current.packs}
                  busy={busy}
                  loaded={Boolean(detail)}
                  onDisable={setConfirmation}
                  onEnable={(pack) => toggle(pack, true)}
                />
              ) : route.page === 'health' ? (
                <>
                  {current.health === 'Degraded' && (
                    <section className="card degraded">
                      <div className="section-heading">
                        <Activity aria-hidden="true" />
                        <h2>Degraded signal</h2>
                      </div>
                      <p>{current.signal}</p>
                      {current.degraded_since && (
                        <p className="muted">
                          Since {date(current.degraded_since)} · Synthetic signal
                        </p>
                      )}
                    </section>
                  )}
                  <div className="kpis">
                    <Kpi
                      label="Officers online"
                      value={current.health === 'Not yet live' ? null : current.officers_online}
                      icon={<Users />}
                    />
                    <Kpi
                      label="Code21 volume · 7 days"
                      value={current.health === 'Not yet live' ? null : current.code21_7d}
                      icon={<Activity />}
                    />
                    <Kpi
                      label="Assigned domain packs"
                      value={current.packs.length}
                      icon={<Layers3 />}
                    />
                  </div>
                  <section className="card">
                    <h2>Metric source</h2>
                    <p>
                      {current.observed_at
                        ? `Synthetic fixture snapshot, seeded ${date(current.observed_at)}. No live telemetry is connected.`
                        : 'No metrics are available. This council is awaiting provisioning.'}
                    </p>
                    <button
                      className="secondary"
                      onClick={() => navigate('municipalities', current.id)}
                    >
                      View municipality
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </section>
                </>
              ) : (
                <>
                  <div className="overview-grid">
                    <section className="card">
                      <div className="section-heading">
                        <Layers3 aria-hidden="true" />
                        <h2>Domain packs assigned</h2>
                      </div>
                      <div className="chips">
                        {current.packs.length ? (
                          current.packs.map((pack) => (
                            <span key={pack} className="chip">
                              {packLabel(pack)}
                            </span>
                          ))
                        ) : (
                          <p className="muted">No packs assigned</p>
                        )}
                      </div>
                      <button className="text-button" onClick={() => navigate('packs', current.id)}>
                        Manage packs
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </section>
                    <section className="card">
                      <div className="section-heading">
                        <Users aria-hidden="true" />
                        <h2>First council admin</h2>
                      </div>
                      <strong>
                        {current.first_name} {current.last_name}
                      </strong>
                      <p>{current.admin_email}</p>
                      <p className="muted">
                        Seeded {date(current.created_at)} ·{' '}
                        {current.activation_state ?? 'Not designated'}
                      </p>
                    </section>
                  </div>
                  <Boundary />
                </>
              )}
              {!detail && route.page === 'municipalities' && (
                <section className="card">
                  <h2>Provisioning job</h2>
                  <p>Loading job details…</p>
                  <button className="secondary" disabled={busy} onClick={() => refreshJob()}>
                    Refresh job status
                  </button>
                </section>
              )}
              {route.page === 'municipalities' && (
                <AdminActivation key={current.id} id={current.id} csrf={csrf} onError={fail} />
              )}
              {detail && route.page === 'municipalities' && (
                <ProvisioningStatus
                  job={detail.job}
                  busy={busy}
                  onRefresh={() => refreshJob()}
                  onAction={refreshJob}
                />
              )}
              {detail && route.page === 'municipalities' && (
                <RoutingStatus
                  routes={detail.routes ?? []}
                  unavailable={Boolean(detailError)}
                  busy={busy}
                  onRefresh={() => refreshJob()}
                  onAction={(item, action) => {
                    const scope = detailScope.current;
                    void perform(async () => {
                      await mutate(`/municipalities/${current.id}/routes/${item.id}/${action}`, {
                        version: item.version,
                      });
                      if (scope !== detailScope.current) return;
                      setDetailRefresh((v) => v + 1);
                      setNotice(`Route ${action} requested. Data is retained.`);
                    });
                  }}
                />
              )}
              {detail && (
                <section className="card audit">
                  <h2>Configuration activity</h2>
                  {detail.events.length ? (
                    <ul>
                      {detail.events.map((event) => (
                        <li key={event.id}>
                          <span>
                            {event.action.replaceAll('_', ' ')}
                            {event.details.pack ? ` · ${packLabel(event.details.pack)}` : ''}
                          </span>
                          <time dateTime={event.created_at}>{date(event.created_at)}</time>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">
                      No configuration changes recorded since this fixture was seeded.
                    </p>
                  )}
                </section>
              )}
              {confirmation && (
                <Confirm
                  title={`Turn off ${packLabel(confirmation)}?`}
                  busy={busy}
                  onCancel={() => setConfirmation(null)}
                  onConfirm={() => toggle(confirmation, false)}
                >
                  <p>
                    {current.name} has{' '}
                    {detail?.workloads.find((w) => w.pack === confirmation)?.open_count ??
                      'an unknown number of'}{' '}
                    open {packLabel(confirmation)} service requests in the synthetic workload
                    snapshot.
                  </p>
                  <p>
                    New work is blocked until this pack is re-enabled. Authorised users can still
                    review retained requests and their audit history.
                  </p>
                  {error && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                </Confirm>
              )}
            </>
          )
        ) : (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">CivicMAPS ecosystem</p>
                <h1>
                  {route.page === 'health'
                    ? 'Network health'
                    : route.page === 'packs'
                      ? 'Domain packs'
                      : 'Municipalities'}
                </h1>
                <p>
                  {route.page === 'health'
                    ? 'Usage and service health across the council network.'
                    : route.page === 'packs'
                      ? 'Select a council to manage its assigned capabilities.'
                      : `${municipalities.length} councils on the network. Manage their identity and capabilities.`}
                </p>
              </div>
              <div className="actions">
                <button
                  className="secondary"
                  disabled={busy}
                  aria-label="Refresh"
                  onClick={() => void perform(load)}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Refresh
                </button>
                {route.page === 'municipalities' && (
                  <button onClick={() => navigate('onboarding')}>
                    <Plus size={18} aria-hidden="true" />
                    Add municipality
                  </button>
                )}
              </div>
            </div>
            {route.page === 'health' && (
              <>
                <div className="kpis">
                  <Kpi
                    label="Councils on network"
                    value={municipalities.length}
                    icon={<Building2 />}
                  />
                  <Kpi
                    label="Active councils"
                    value={municipalities.filter((m) => m.status === 'Active').length}
                    icon={<ShieldCheck />}
                  />
                  <Kpi
                    label="Officers signed on today"
                    value={municipalities.reduce((total, m) => total + (m.officers_today ?? 0), 0)}
                    icon={<Users />}
                  />
                  <Kpi
                    label="Degraded councils"
                    value={municipalities.filter((m) => m.health === 'Degraded').length}
                    icon={<Activity />}
                  />
                </div>
                {municipalities.some((m) => m.health === 'Degraded') && (
                  <div className="health-alert">
                    <Activity size={20} aria-hidden="true" />
                    <div>
                      <strong>Network attention required</strong>
                      <p>
                        {municipalities
                          .filter((m) => m.health === 'Degraded')
                          .map((m) => m.name)
                          .join(', ')}{' '}
                        has a degraded synthetic health signal. Select the council to inspect it.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            <section className="card directory">
              <div className="filters">
                <label className="search">
                  <Search size={18} aria-hidden="true" />
                  <input
                    aria-label="Search council name or slug"
                    type="search"
                    placeholder="Search council name or slug…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label className="filter-label">
                  Status
                  <select
                    aria-label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {['All', 'Active', 'Provisioning', 'Suspended'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <span className="muted">{filtered.length} results</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {(route.page === 'health'
                        ? [
                            ['name', 'Council'],
                            ['status', 'Status'],
                            ['officers_online', 'Officers online'],
                            ['code21_7d', 'Code21 volume (7d)'],
                            ['health', 'Health'],
                          ]
                        : [
                            ['name', 'Council'],
                            ['slug', 'Subdomain'],
                            ['status', 'Status'],
                            ['packs', 'Domain packs'],
                            ['created_at', 'Added'],
                          ]
                      ).map(([key, label]) => (
                        <th
                          key={key}
                          aria-sort={
                            sort.key === key
                              ? sort.descending
                                ? 'descending'
                                : 'ascending'
                              : undefined
                          }
                        >
                          {['name', 'status', 'officers_online', 'code21_7d', 'health'].includes(
                            key,
                          ) ? (
                            <button
                              className="sort-button"
                              onClick={() => changeSort(key as typeof sort.key)}
                            >
                              {label}
                              <ChevronDown size={12} aria-hidden="true" />
                            </button>
                          ) : (
                            label
                          )}
                        </th>
                      ))}
                      <th>
                        <span className="sr-only">Open council</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <a className="council-link" href={`#${route.page}/${m.id}`}>
                            <span className="council-icon" aria-hidden="true">
                              <Building2 size={17} />
                            </span>
                            {m.name}
                          </a>
                        </td>
                        {route.page !== 'health' && (
                          <td>
                            <code>{m.slug}</code>
                          </td>
                        )}
                        <td>
                          <Badge value={m.status} />
                        </td>
                        {route.page === 'health' ? (
                          <>
                            <td>
                              {number(m.health === 'Not yet live' ? null : m.officers_online)}
                            </td>
                            <td>{number(m.health === 'Not yet live' ? null : m.code21_7d)}</td>
                            <td>
                              <Badge value={m.health} />
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <span className="pack-count">{m.packs.length}</span> assigned
                            </td>
                            <td>{date(m.created_at)}</td>
                          </>
                        )}
                        <td>
                          <a
                            className="row-arrow"
                            href={`#${route.page}/${m.id}`}
                            aria-label={`Open ${m.name}`}
                          >
                            <ArrowRight size={16} aria-hidden="true" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <div className="empty">
                  <Building2 size={32} aria-hidden="true" />
                  <h2>No matching municipalities</h2>
                  <p>Try another council name, slug or status.</p>
                  <button
                    className="secondary"
                    onClick={() => {
                      setSearch('');
                      setStatus('All');
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
            <p className="footer-note">
              CivicMAPS Platform · Cross-council configuration · Council operational records stay
              outside this control plane.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
function Kpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}) {
  return (
    <section className="kpi">
      <div className="kpi-top">
        <span>{label}</span>
        <span aria-hidden="true">{icon}</span>
      </div>
      <strong>{number(value)}</strong>
      <small>Synthetic snapshot</small>
    </section>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
