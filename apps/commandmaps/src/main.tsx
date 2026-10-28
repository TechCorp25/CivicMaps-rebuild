import { RequestComposer, type RequestDraft } from './RequestComposer';
import { RequestQueue, RequestStatus } from './RequestQueue';
import { OperationalMap, type LocationPoint } from './GoogleLocationPicker';
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
import {
  getHttpStatus,
  isRequestCancelled,
  isUncertainWriteError,
  requestJson,
} from '../../shared/api-transport.mjs';

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
type QueuePage = {
  requests: Request[];
  nextCursor: string | null;
  counts?: { total: string; active: string; closed: string; received: string };
};
type SelectedDetail = {
  id: string;
  data?: Request;
  status: 'loading' | 'ready' | 'unavailable';
  error?: string;
};
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
type RefreshSource = 'interval' | 'focus';
type ClientReadTrace = {
  operation: 'selection' | 'refresh' | 'refresh-trigger' | 'refresh-complete' | 'history';
  requestId: string | null;
  requestGeneration: number;
  loadGeneration: number;
  scopeGeneration: number;
  source?: 'manual' | RefreshSource;
};
declare global {
  interface Window {
    __CIVICMAPS_TEST_TRACE__?: (event: ClientReadTrace) => void;
    __CIVICMAPS_TEST_REFRESH_SCHEDULER__?: (refresh: (source: RefreshSource) => void) => () => void;
  }
}
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestJson<T>('/api', path, options);
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
  const [queueCounts, setQueueCounts] = useState<QueuePage['counts']>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  const [search, setSearch] = useState('');
  const [detailState, setDetailState] = useState<SelectedDetail | null>(null);
  const [queueState, setQueueState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [queueError, setQueueError] = useState('');
  const [queueCheckedAt, setQueueCheckedAt] = useState<string | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const selectionGeneration = useRef(0);
  const historyRetryController = useRef<AbortController | null>(null);
  const recoveryController = useRef<AbortController | null>(null);
  const mutationController = useRef<AbortController | null>(null);
  const detailRequestGeneration = useRef(0);
  const historyRequestGeneration = useRef(0);
  const [auditState, setAuditState] = useState<AuditState | null>(null);
  const [actionRecoveries, setActionRecoveries] = useState<Record<string, RecoveryAction>>({});
  const [assignmentDraft, setAssignmentDraft] = useState('');
  const [closureReasonDraft, setClosureReasonDraft] = useState('');
  const assignmentDraftDirty = useRef(false);
  const [creating, setCreating] = useState(false);
  const [draftLocation, setDraftLocation] = useState<LocationPoint | null>(null);
  const [createUncertain, setCreateUncertain] = useState(false);
  const [filter, setFilter] = useState('active');
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const pending = useRef(false);
  const hasQueueSnapshot = useRef(false);
  const scopeGeneration = useRef(0);
  const activeScope = useRef<string | null>(null);
  const current =
    detailState?.id === selected && detailState.status === 'ready' ? detailState.data : undefined;
  const currentId = current?.id;
  const currentVersion = current?.version;
  const actionRecovery = currentId ? actionRecoveries[currentId] : undefined;
  const scopeKey = actor
    ? `${actor.id}:${actor.context_id ?? ''}:${actor.tenant_id}:${actor.jurisdiction_id}:${actor.branch_id}:${entitlement?.version ?? ''}`
    : '';
  const loadGeneration = useRef(0);
  const queueLoadController = useRef<AbortController | null>(null);
  const selectedDetailController = useRef<AbortController | null>(null);
  const historyController = useRef<AbortController | null>(null);
  const loginController = useRef<AbortController | null>(null);
  const activeLoadCount = useRef(0);
  const loadedRequestCount = useRef(0);
  const queueFilter = useRef(filter);
  const queueSearch = useRef(search.trim());
  queueFilter.current = filter;
  queueSearch.current = search.trim();
  const traceRead = useCallback(
    (event: Omit<ClientReadTrace, 'loadGeneration' | 'scopeGeneration'>) => {
      window.__CIVICMAPS_TEST_TRACE__?.({
        ...event,
        loadGeneration: loadGeneration.current,
        scopeGeneration: scopeGeneration.current,
      });
    },
    [],
  );
  const cancelPendingReads = useCallback(() => {
    queueLoadController.current?.abort();
    selectedDetailController.current?.abort();
    historyController.current?.abort();
    historyRetryController.current?.abort();
    recoveryController.current?.abort();
    mutationController.current?.abort();
    loginController.current?.abort();
  }, []);
  function updateActionRecovery(requestId: string, recovery: RecoveryAction | null) {
    setActionRecoveries((existing) => {
      const next = { ...existing };
      if (recovery) next[requestId] = recovery;
      else delete next[requestId];
      return next;
    });
  }
  const load = useCallback(
    async (
      scheduled = false,
      cursor: string | null = null,
      source: 'manual' | RefreshSource = 'manual',
    ) => {
      // A timer must not invalidate a cursor walk that is still collecting later pages.
      if (scheduled && activeLoadCount.current > 0) return null;
      activeLoadCount.current++;
      const generation = ++loadGeneration.current;
      const queueController = new AbortController();
      queueLoadController.current?.abort();
      queueLoadController.current = queueController;
      if (!cursor && !hasQueueSnapshot.current) setQueueState('loading');
      if (cursor) {
        setLoadingMore(true);
        setLoadMoreError('');
      }
      setQueueError('');
      let selectedController: AbortController | null = null;
      try {
        const session = await api<Session>('/auth/session', { signal: queueController.signal });
        if (generation !== loadGeneration.current) return null;
        const nextScope = `${session.actor.id}:${session.actor.context_id ?? ''}:${session.actor.tenant_id}:${session.actor.jurisdiction_id}:${session.actor.branch_id}:${session.entitlements.version ?? ''}`;
        if (activeScope.current && activeScope.current !== nextScope) {
          ++scopeGeneration.current;
          selectedDetailController.current?.abort();
          historyController.current?.abort();
          hasQueueSnapshot.current = false;
          setQueueState('loading');
          setRequests([]);
          setQueueCounts(undefined);
          setNextCursor(null);
          loadedRequestCount.current = 0;
          setDetailState(null);
          setOfficers([]);
          setSelection(null);
          setCreating(false);
          setDraftLocation(null);
          setAuditState(null);
          setActionRecoveries({});
          setQueueCheckedAt(null);
          setActor(session.actor);
          retry.current = null;
        }
        activeScope.current = nextScope;
        setEntitlement(session.entitlements);
        setCsrf(session.csrfToken);
        const refreshLoadedExtent = !cursor && hasQueueSnapshot.current;
        const previousLoadedCount = refreshLoadedExtent ? loadedRequestCount.current : 0;
        const capabilities = session.entitlements.capabilities;
        if (!capabilities.includes('requests.create')) {
          setCreating(false);
          setDraftLocation(null);
        }
        const selectedAtStart = selectedRef.current;
        const selectedScopeGeneration = scopeGeneration.current;
        const selectedDetailGeneration =
          !cursor && selectedAtStart && capabilities.includes('requests.read')
            ? ++detailRequestGeneration.current
            : null;
        selectedController = selectedDetailGeneration ? new AbortController() : null;
        if (selectedController) {
          selectedDetailController.current?.abort();
          selectedDetailController.current = selectedController;
          traceRead({
            operation: 'refresh',
            requestId: selectedAtStart,
            requestGeneration: selectedDetailGeneration ?? detailRequestGeneration.current,
            source,
          });
        }
        const [queueResult, rosterResult, selectedDetail] = await Promise.all([
          capabilities.includes('requests.read')
            ? (async () => {
                const params = new URLSearchParams({
                  status: queueFilter.current,
                  ...(queueSearch.current ? { q: queueSearch.current } : {}),
                  ...(cursor ? { before: cursor } : {}),
                });
                return api<QueuePage>(`/requests?${params}`, { signal: queueController.signal });
              })().then(
                (data) => ({ data }),
                (error) => ({ error }),
              )
            : Promise.resolve({ data: [] as Request[] }),
          capabilities.includes('officers.read')
            ? api<Officer[]>('/officers', { signal: queueController.signal }).then(
                (data) => ({ data }),
                (error) => (getHttpStatus(error) === 403 ? { data: [] as Officer[] } : { error }),
              )
            : Promise.resolve({ data: [] as Officer[] }),
          !cursor && selectedAtStart && capabilities.includes('requests.read')
            ? api<Request>(`/requests/${selectedAtStart}`, {
                signal: selectedController?.signal,
              }).then(
                (data) => ({ data }),
                (error) => ({ error }),
              )
            : Promise.resolve(null),
        ]);
        // Detail refreshes belong to their selection and scope, independently of queue paging.
        if (
          selectedScopeGeneration === scopeGeneration.current &&
          activeScope.current === nextScope &&
          selectedAtStart &&
          selectedRef.current === selectedAtStart &&
          selectedDetailGeneration === detailRequestGeneration.current &&
          selectedDetail
        ) {
          if ('data' in selectedDetail)
            setDetailState({ id: selectedAtStart, status: 'ready', data: selectedDetail.data });
          else
            setDetailState({
              id: selectedAtStart,
              status: 'unavailable',
              error:
                selectedDetail.error instanceof Error
                  ? selectedDetail.error.message
                  : 'Request is unavailable in the current operating context.',
            });
        }
        if (generation !== loadGeneration.current) return null;
        if ('error' in queueResult) throw queueResult.error;
        if ('error' in rosterResult) throw rosterResult.error;
        const queue = queueResult.data;
        const roster = rosterResult.data;
        let page = (
          Array.isArray(queue) ? { requests: queue, nextCursor: null } : queue
        ) as QueuePage;
        if (!cursor && refreshLoadedExtent && previousLoadedCount > page.requests.length) {
          const refreshed = [...page.requests];
          const seen = new Set(refreshed.map((request) => request.id));
          let continuation = page.nextCursor;
          while (continuation && seen.size < previousLoadedCount) {
            const params = new URLSearchParams({
              status: queueFilter.current,
              ...(queueSearch.current ? { q: queueSearch.current } : {}),
              before: continuation,
            });
            const nextPage = await api<QueuePage>(`/requests?${params}`, {
              signal: queueController.signal,
            });
            if (generation !== loadGeneration.current) return null;
            for (const request of nextPage.requests) {
              if (!seen.has(request.id)) {
                seen.add(request.id);
                refreshed.push(request);
              }
            }
            continuation = nextPage.nextCursor;
          }
          page = { ...page, requests: refreshed, nextCursor: continuation };
        }
        setRequests((existing) => {
          if (!cursor) {
            loadedRequestCount.current = page.requests.length;
            return page.requests;
          }
          const combined = new Map(existing.map((request) => [request.id, request]));
          for (const request of page.requests) combined.set(request.id, request);
          const result = [...combined.values()];
          loadedRequestCount.current = result.length;
          return result;
        });
        if (!cursor) setQueueCounts(page.counts);
        setNextCursor(page.nextCursor);
        setOfficers(roster);
        hasQueueSnapshot.current = true;
        setQueueState('ready');
        setQueueCheckedAt(new Date().toISOString());
        return page.requests;
      } catch (err) {
        if (isRequestCancelled(err)) return null;
        if (generation === loadGeneration.current) {
          if (cursor)
            setLoadMoreError(
              err instanceof Error ? err.message : 'More requests could not be loaded.',
            );
          if (getHttpStatus(err) === 401) {
            ++loadGeneration.current;
            ++scopeGeneration.current;
            hasQueueSnapshot.current = false;
            activeScope.current = null;
            cancelPendingReads();
            setActor(null);
            setCreating(false);
            setDraftLocation(null);
            setCsrf('');
            setEntitlement(null);
            setRequests([]);
            loadedRequestCount.current = 0;
            setOfficers([]);
            setSelection(null);
            setAuditState(null);
            setActionRecoveries({});
            setQueueCheckedAt(null);
            setQueueState('unavailable');
          } else if (!cursor) {
            setQueueState('unavailable');
            setQueueError(err instanceof Error ? err.message : 'Requests could not be refreshed.');
          }
        }
        throw err;
      } finally {
        if (source !== 'manual')
          traceRead({
            operation: 'refresh-complete',
            requestId: selectedRef.current,
            requestGeneration: detailRequestGeneration.current,
            source,
          });
        activeLoadCount.current--;
        if (queueLoadController.current === queueController) queueLoadController.current = null;
        if (selectedController && selectedDetailController.current === selectedController)
          selectedDetailController.current = null;
        if (cursor) setLoadingMore(false);
      }
    },
    [cancelPendingReads, traceRead],
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api<Session>('/auth/session', { signal: controller.signal })
      .then((session) => {
        if (active) {
          activeScope.current = `${session.actor.id}:${session.actor.context_id ?? ''}:${session.actor.tenant_id}:${session.actor.jurisdiction_id}:${session.actor.branch_id}:${session.entitlements.version ?? ''}`;
          setActor(session.actor);
          setCsrf(session.csrfToken);
          setEntitlement(session.entitlements);
        }
      })
      .catch((err) => {
        if (active && !isRequestCancelled(err) && getHttpStatus(err) !== 401) setError(err.message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);
  useEffect(() => () => loginController.current?.abort(), []);
  useEffect(() => {
    if (!actor || actor.role === 'ADMIN') return;
    ++loadGeneration.current;
    hasQueueSnapshot.current = false;
    setQueueState('loading');
    setQueueCheckedAt(null);
    setRequests([]);
    loadedRequestCount.current = 0;
    setQueueCounts(undefined);
    setNextCursor(null);
    const timer = setTimeout(() => void load().catch(() => {}), 250);
    return () => {
      clearTimeout(timer);
      queueLoadController.current?.abort();
      selectedDetailController.current?.abort();
      // Queue filters do not change the selected record's authority scope. Keep its
      // independent history read alive so a search cannot strand the history spinner.
    };
  }, [actor, filter, search, load]);
  useEffect(() => {
    if (!actor || actor.role === 'ADMIN') return;
    const refresh = (source: RefreshSource) => {
      traceRead({
        operation: 'refresh-trigger',
        requestId: selectedRef.current,
        requestGeneration: detailRequestGeneration.current,
        source,
      });
      void load(true, null, source).catch(() => {});
    };
    const disposeTestScheduler = window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__?.((source) =>
      refresh(source),
    );
    const timer = disposeTestScheduler ? null : setInterval(() => refresh('interval'), 10000);
    const onFocus = () => refresh('focus');
    if (!disposeTestScheduler) addEventListener('focus', onFocus);
    return () => {
      if (timer !== null) clearInterval(timer);
      if (!disposeTestScheduler) removeEventListener('focus', onFocus);
      disposeTestScheduler?.();
    };
  }, [actor, load, traceRead]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const generation = scopeGeneration.current;
    const requestGeneration = ++detailRequestGeneration.current;
    if (!actor || !selected) {
      setDetailState(null);
      setAuditState(null);
      return () => {
        active = false;
      };
    }
    const requestId = selected;
    traceRead({ operation: 'selection', requestId, requestGeneration });
    setDetailState({ id: requestId, status: 'loading' });
    selectedDetailController.current?.abort();
    selectedDetailController.current = controller;
    api<Request>(`/requests/${requestId}`, { signal: controller.signal })
      .then((data) => {
        if (
          active &&
          generation === scopeGeneration.current &&
          requestGeneration === detailRequestGeneration.current
        )
          setDetailState({ id: requestId, status: 'ready', data });
      })
      .catch((err) => {
        if (isRequestCancelled(err)) return;
        if (
          active &&
          generation === scopeGeneration.current &&
          requestGeneration === detailRequestGeneration.current
        )
          setDetailState({
            id: requestId,
            status: 'unavailable',
            error: err instanceof Error ? err.message : 'Request is unavailable in this context.',
          });
      });
    return () => {
      active = false;
      controller.abort();
      if (selectedDetailController.current === controller) selectedDetailController.current = null;
    };
  }, [actor, selected, scopeKey, traceRead]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const generation = scopeGeneration.current;
    const requestGeneration = ++historyRequestGeneration.current;
    if (!actor || !selected) {
      setAuditState(null);
      return () => {
        active = false;
      };
    }
    const requestId = selected;
    historyController.current?.abort();
    historyController.current = controller;
    if (current?.id !== requestId) {
      setAuditState({ requestId, scopeKey, status: 'loading', events: [] });
      return () => {
        active = false;
      };
    }
    setAuditState({ requestId, scopeKey, status: 'loading', events: [] });
    traceRead({ operation: 'history', requestId, requestGeneration });
    api<Audit[]>(`/requests/${requestId}/audit`, { signal: controller.signal })
      .then((data) => {
        if (active && generation === scopeGeneration.current)
          setAuditState({ requestId, scopeKey, status: 'ready', events: data });
      })
      .catch((err) => {
        if (isRequestCancelled(err)) return;
        if (!active || generation !== scopeGeneration.current) return;
        if (getHttpStatus(err) === 401) {
          ++loadGeneration.current;
          ++scopeGeneration.current;
          hasQueueSnapshot.current = false;
          activeScope.current = null;
          cancelPendingReads();
          setActor(null);
          setCreating(false);
          setDraftLocation(null);
          setCsrf('');
          setEntitlement(null);
          setRequests([]);
          loadedRequestCount.current = 0;
          setOfficers([]);
          setSelection(null);
          setAuditState(null);
          setActionRecoveries({});
          setQueueCheckedAt(null);
          setQueueState('unavailable');
          return;
        }
        setAuditState({
          requestId,
          scopeKey,
          status: 'unavailable',
          events: [],
          error: err instanceof Error ? err.message : 'History could not be loaded.',
        });
      });
    return () => {
      active = false;
      controller.abort();
      if (historyController.current === controller) historyController.current = null;
    };
  }, [
    actor,
    selected,
    scopeKey,
    current?.id,
    currentId,
    currentVersion,
    traceRead,
    cancelPendingReads,
  ]);
  useEffect(() => {
    if (current && !assignmentDraftDirty.current)
      setAssignmentDraft(current.assigned_officer_id ?? '');
  }, [current, currentId, currentVersion, current?.assigned_officer_id]);
  function setSelection(id: string | null) {
    if (selectedRef.current !== id) {
      selectionGeneration.current++;
      historyRetryController.current?.abort();
      historyRetryController.current = null;
      recoveryController.current?.abort();
      recoveryController.current = null;
    }
    selectedRef.current = id;
    setSelected(id);
  }
  function selectRequest(id: string) {
    if (selectedRef.current === id) return;
    setSelection(id);
    setDetailState({ id, status: 'loading' });
    assignmentDraftDirty.current = false;
    setAssignmentDraft(requests.find((request) => request.id === id)?.assigned_officer_id ?? '');
    setClosureReasonDraft('');
  }
  async function perform(work: () => Promise<void>) {
    if (pending.current) return;
    const expectedScope = scopeGeneration.current;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (err) {
      if (isRequestCancelled(err) || expectedScope !== scopeGeneration.current) return;
      setError(err instanceof Error ? err.message : 'The operation could not be completed');
      if (getHttpStatus(err) === 401) {
        ++loadGeneration.current;
        ++scopeGeneration.current;
        hasQueueSnapshot.current = false;
        activeScope.current = null;
        cancelPendingReads();
        setActor(null);
        setCreating(false);
        setDraftLocation(null);
        setCsrf('');
        setEntitlement(null);
        setRequests([]);
        loadedRequestCount.current = 0;
        setQueueCounts(undefined);
        setNextCursor(null);
        setDetailState(null);
        setOfficers([]);
        setSelection(null);
        setAuditState(null);
        setActionRecoveries({});
        setQueueCheckedAt(null);
        setQueueState('unavailable');
      }
      if ([403, 409].includes(getHttpStatus(err) ?? 0)) await load().catch(() => {});
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
    const controller = new AbortController();
    mutationController.current?.abort();
    mutationController.current = controller;
    let result: Request;
    try {
      result = await api<Request>(path, {
        method: 'POST',
        headers: { 'x-csrf-token': csrf, 'Idempotency-Key': key },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
    } finally {
      if (mutationController.current === controller) mutationController.current = null;
    }
    if (retry.current?.key === key) retry.current = null;
    if (expectedScope !== scopeGeneration.current) return result;
    if (selectedRef.current === result.id)
      setDetailState({ id: result.id, status: 'ready', data: result });
    setRequests((existing) => {
      const index = existing.findIndex((request) => request.id === result.id);
      if (index < 0) return path === '/requests' ? [result, ...existing].slice(0, 100) : existing;
      return existing.map((request) => (request.id === result.id ? result : request));
    });
    if (path === '/requests') {
      setSelection(result.id);
    }
    await load().catch(() => {});
    setNotice('Saved to the operational record');
    return result;
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const controller = new AbortController();
    loginController.current?.abort();
    loginController.current = controller;
    void perform(async () => {
      await api<{ actor: Actor; csrfToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
        signal: controller.signal,
      });
      const profile = await api<Session>('/auth/session', { signal: controller.signal });
      setActor(profile.actor);
      activeScope.current = `${profile.actor.id}:${profile.actor.context_id ?? ''}:${profile.actor.tenant_id}:${profile.actor.jurisdiction_id}:${profile.actor.branch_id}:${profile.entitlements.version ?? ''}`;
      setCsrf(profile.csrfToken);
      setEntitlement(profile.entitlements);
    }).finally(() => {
      if (loginController.current === controller) loginController.current = null;
    });
  }
  function create(draft: RequestDraft) {
    void perform(async () => {
      try {
        await mutate('/requests', draft);
        setCreating(false);
        setDraftLocation(null);
        setCreateUncertain(false);
      } catch (err) {
        if (isUncertainWriteError(err)) {
          setCreateUncertain(true);
          await load().catch(() => {});
        }
        throw err;
      }
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
          getHttpStatus(err) === 409
            ? 'conflict'
            : isUncertainWriteError(err)
              ? 'uncertain'
              : (getHttpStatus(err) ?? 500) < 500
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
    const selection = selectionGeneration.current;
    const controller = new AbortController();
    recoveryController.current?.abort();
    recoveryController.current = controller;
    await perform(async () => {
      let latest: Request;
      try {
        latest = await api<Request>(`/requests/${recovery.requestId}`, {
          signal: controller.signal,
        });
      } catch (err) {
        if (getHttpStatus(err) !== 404) throw err;
        if (selectedRef.current === recovery.requestId) {
          setDetailState({
            id: recovery.requestId,
            status: 'unavailable',
            error: 'Selected request unavailable in the current operating context.',
          });
          setAuditState({
            requestId: recovery.requestId,
            scopeKey,
            status: 'unavailable',
            events: [],
            error: 'History is unavailable because the selected request is inaccessible.',
          });
        }
        updateActionRecovery(recovery.requestId, {
          ...recovery,
          kind: 'reconciled',
          message:
            'The selected request is no longer accessible. The earlier action was not replayed.',
          retrySameAction: false,
        });
        return;
      }
      if (
        generation !== scopeGeneration.current ||
        selection !== selectionGeneration.current ||
        selectedRef.current !== recovery.requestId
      )
        return;
      const history = await api<Audit[]>(`/requests/${recovery.requestId}/audit`, {
        signal: controller.signal,
      });
      if (
        generation !== scopeGeneration.current ||
        selection !== selectionGeneration.current ||
        selectedRef.current !== recovery.requestId
      )
        return;
      if (selectedRef.current === recovery.requestId) {
        setDetailState({ id: recovery.requestId, status: 'ready', data: latest });
        setAuditState({
          requestId: recovery.requestId,
          scopeKey,
          status: 'ready',
          events: history,
        });
      }
      setRequests((existing) =>
        existing.map((request) => (request.id === latest.id ? latest : request)),
      );
      const unchanged = latest.version === recovery.version;
      updateActionRecovery(recovery.requestId, {
        ...recovery,
        kind: 'reconciled',
        latestVersion: latest.version,
        retrySameAction: unchanged && recovery.key !== null,
        message: unchanged
          ? `Server state and history were refreshed independently. The request remains at version ${latest.version}. Review it before choosing whether to retry the same action.`
          : `Server state and history were refreshed independently. The request is now at version ${latest.version}; the earlier action will not be replayed. Review the confirmed state before choosing another available action.`,
      });
      void load(true).catch(() => {});
    }).finally(() => {
      if (recoveryController.current === controller) recoveryController.current = null;
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
          getHttpStatus(err) === 409
            ? 'conflict'
            : isUncertainWriteError(err)
              ? 'uncertain'
              : (getHttpStatus(err) ?? 500) < 500
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
                setCreating(false);
                setDraftLocation(null);
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
                  setCreating(false);
                  setDraftLocation(null);
                  setCsrf('');
                  setRequests([]);
                  loadedRequestCount.current = 0;
                  setOfficers([]);
                  setSelection(null);
                  setAuditState(null);
                  setActionRecoveries({});
                  setQueueCheckedAt(null);
                  setQueueState('unavailable');
                  retry.current = null;
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
                    setCreateUncertain(false);
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
              uncertain={createUncertain}
              initialLocation={draftLocation}
              onClose={() => {
                setCreating(false);
                setDraftLocation(null);
                setError('');
              }}
              onCreate={create}
            />
          )}
          <div className="dashboard-stack">
            <OperationalMap
              key={scopeKey}
              requests={
                current && !requests.some((request) => request.id === current.id)
                  ? [...requests, current]
                  : requests
              }
              selected={selected}
              onSelect={selectRequest}
              draftLocation={draftLocation}
              canCreate={can('requests.create')}
              coverage={
                queueState === 'unavailable' && hasQueueSnapshot.current ? 'stale' : queueState
              }
              hasMore={Boolean(nextCursor)}
              onCreateLocation={(point) => {
                setDraftLocation(point);
                setCreateUncertain(false);
                setCreating(true);
              }}
            />
            <details className="operations-panel" open>
              <summary>Operational queue and selected request</summary>
              <div className="queue-layout">
                <RequestQueue
                  requests={requests}
                  officers={officers}
                  selected={selected}
                  onSelect={selectRequest}
                  filter={filter}
                  onFilter={setFilter}
                  search={search}
                  onSearch={setSearch}
                  counts={queueCounts}
                  state={queueState}
                  hasMore={Boolean(nextCursor)}
                  loadingMore={loadingMore}
                  loadMoreError={loadMoreError}
                  onLoadMore={() => nextCursor && void load(false, nextCursor).catch(() => {})}
                />
                <section className="panel detail" aria-labelledby="detail-title">
                  {!current ? (
                    <div className="empty">
                      <MapPin size={36} aria-hidden="true" />
                      {selected ? (
                        <>
                          <h2 id="detail-title">
                            {detailState?.id === selected && detailState.status === 'loading'
                              ? 'Loading selected request'
                              : 'Selected request unavailable'}
                          </h2>
                          <p>
                            {detailState?.id === selected && detailState.status === 'loading'
                              ? 'The service is checking this request in the current operating context.'
                              : (detailState?.error ??
                                'This request is unavailable in the current operating context.')}
                          </p>
                          <button
                            className="secondary"
                            onClick={() => {
                              setSelection(null);
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
                            setSelection(null);
                            requestAnimationFrame(() => {
                              const row = document.querySelector<HTMLElement>(
                                `[data-request-id="${requestId}"] .request-link`,
                              );
                              (
                                row ?? document.querySelector<HTMLElement>('.queue-scroll')
                              )?.focus();
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
                          {actionRecovery.kind === 'reconciled' &&
                            actionRecovery.retrySameAction && (
                              <button
                                className="secondary"
                                disabled={busy}
                                onClick={retrySameAction}
                              >
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
                            action('close', {
                              reason: new FormData(e.currentTarget).get('reason'),
                            });
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
                                const selection = selectionGeneration.current;
                                const controller = new AbortController();
                                historyRetryController.current?.abort();
                                historyRetryController.current = controller;
                                setAuditState({
                                  requestId,
                                  scopeKey: requestScope,
                                  status: 'loading',
                                  events: [],
                                });
                                void api<Audit[]>(`/requests/${requestId}/audit`, {
                                  signal: controller.signal,
                                })
                                  .then((events) => {
                                    if (
                                      generation === scopeGeneration.current &&
                                      selection === selectionGeneration.current &&
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
                                      isRequestCancelled(err) ||
                                      generation !== scopeGeneration.current ||
                                      selection !== selectionGeneration.current ||
                                      selectedRef.current !== requestId
                                    )
                                      return;
                                    if (getHttpStatus(err) === 401) {
                                      ++loadGeneration.current;
                                      ++scopeGeneration.current;
                                      hasQueueSnapshot.current = false;
                                      activeScope.current = null;
                                      setSelection(null);
                                      setActor(null);
                                      setCreating(false);
                                      setDraftLocation(null);
                                      setCsrf('');
                                      setEntitlement(null);
                                      setRequests([]);
                                      loadedRequestCount.current = 0;
                                      setOfficers([]);
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
                                  })
                                  .finally(() => {
                                    if (historyRetryController.current === controller)
                                      historyRetryController.current = null;
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
                                {typeof event.details.reason === 'string' &&
                                  event.details.reason && <p>{event.details.reason}</p>}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </>
                  )}
                </section>
              </div>
            </details>
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
