import { useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react';
import { LifecycleStatusPill } from '../../../_ds/components/LifecycleStatusPill';

export type QueueRequest = {
  id: string;
  number: string;
  address: string;
  status: string;
  assigned_officer_id: string | null;
  updated_at: string;
};
const canonicalStatus = {
  RECEIVED: 'RECEIVED',
  DISPATCHED: 'DISPATCHED_NOT_ACTIVE',
  ACKNOWLEDGED: 'DISPATCHED_ACTIVE',
  ATTENDED: 'ATTENDED',
  CLOSED: 'CLOSED',
} as const;
export function RequestStatus({ status }: { status: string }) {
  const mapped = canonicalStatus[status as keyof typeof canonicalStatus];
  // Do not let the design example's default turn an unknown server state into Received.
  return (
    <span className="status status-component">
      {mapped ? <LifecycleStatusPill status={mapped} /> : status}
    </span>
  );
}
export const requestNumber = (number: string) => `SR-${String(number).padStart(7, '0')}`;
export const requestDate = (value: string) =>
  new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Australia/Melbourne',
  }).format(new Date(value));

export function RequestQueue({
  requests,
  officers,
  selected,
  onSelect,
  filter,
  onFilter,
  search,
  onSearch,
  counts,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  state,
}: {
  requests: QueueRequest[];
  officers: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  filter: string;
  onFilter: (value: string) => void;
  search: string;
  onSearch: (value: string) => void;
  counts?: { total: string; active: string; closed: string; received: string };
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string;
  onLoadMore: () => void;
  state: 'loading' | 'ready' | 'unavailable';
}) {
  const [page, setPage] = useState(0);
  const visible = requests;
  const pages = Math.max(1, Math.ceil(visible.length / 25));
  const currentPage = Math.min(page, pages - 1);
  const chooseFilter = (value: string) => {
    onFilter(value);
    setPage(0);
  };
  return (
    <section className="panel queue" aria-labelledby="queue-title">
      <div className="queue-heading">
        <h2 id="queue-title">Operational queue</h2>
        <p className="muted" id="queue-limit">
          {counts ? `${counts.total} authorised requests match this search. ` : ''}
          {requests.length} loaded.
        </p>
        <div className="queue-filters" aria-label="Queue filters">
          {[
            ['active', 'Open', counts?.active ?? '—'],
            ['received', 'Needs dispatch', counts?.received ?? '—'],
            ['all', 'All', counts?.total ?? '—'],
          ].map(([value, label, count]) => (
            <button
              key={value}
              className="filter-chip"
              aria-pressed={filter === value}
              onClick={() => chooseFilter(String(value))}
            >
              {label}
              <span className="mono">{count}</span>
            </button>
          ))}
        </div>
        <div className="queue-controls">
          <label className="queue-search">
            Search all requests
            <span>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                maxLength={250}
                value={search}
                onChange={(e) => {
                  onSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Address or SR number"
                aria-describedby="queue-limit"
              />
            </span>
          </label>
          <label className="filter">
            Show
            <select value={filter} onChange={(e) => chooseFilter(e.target.value)}>
              <option value="active">Active</option>
              <option value="received">Needs dispatch</option>
              <option value="closed">Closed</option>
              <option value="all">All requests</option>
            </select>
          </label>
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="empty">
          <ClipboardList size={36} aria-hidden="true" />
          <h3>
            {state === 'loading'
              ? 'Loading requests'
              : state === 'unavailable'
                ? 'Requests unavailable'
                : 'No matching requests'}
          </h3>
          <p>
            {state === 'loading'
              ? 'Loading the current operating context.'
              : state === 'unavailable'
                ? 'Retry the queue refresh to see requests.'
                : 'Change the search or filter to find other requests.'}
          </p>
        </div>
      ) : (
        <div className="queue-scroll" tabIndex={0} role="region" aria-label="Service request table">
          <table className="request-table">
            <thead>
              <tr>
                <th scope="col">SR / address</th>
                <th scope="col">Status</th>
                <th scope="col">Officer</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.slice(currentPage * 25, (currentPage + 1) * 25).map((request) => (
                <tr
                  key={request.id}
                  data-request-id={request.id}
                  className={selected === request.id ? 'selected' : ''}
                >
                  <td>
                    <button
                      className="request-link"
                      aria-pressed={selected === request.id}
                      onClick={() => onSelect(request.id)}
                    >
                      <span className="mono">{requestNumber(request.number)}</span>
                      <strong>{request.address}</strong>
                    </button>
                  </td>
                  <td>
                    <RequestStatus status={request.status} />
                  </td>
                  <td>
                    {officers.find((o) => o.id === request.assigned_officer_id)?.name ??
                      (request.assigned_officer_id
                        ? 'Assigned officer (directory unavailable)'
                        : 'Unassigned')}
                  </td>
                  <td className="mono">
                    <time dateTime={request.updated_at}>{requestDate(request.updated_at)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav className="queue-pagination" aria-label="Queue pages">
        <span className="muted">
          25 per page · Page {currentPage + 1} of {pages} · {visible.length} loaded results
        </span>
        <button
          className="icon-button"
          aria-label="Previous queue page"
          disabled={currentPage === 0}
          onClick={() => setPage(currentPage - 1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          aria-label="Next queue page"
          disabled={currentPage + 1 >= pages}
          onClick={() => setPage(currentPage + 1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
      {hasMore && (
        <div className="queue-load-more">
          {loadMoreError && (
            <p className="error" role="alert">
              {loadMoreError}
            </p>
          )}
          <button className="secondary" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore ? 'Loading…' : 'Load more requests'}
          </button>
        </div>
      )}
    </section>
  );
}
