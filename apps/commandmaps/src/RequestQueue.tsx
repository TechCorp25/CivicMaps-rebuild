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
}: {
  requests: QueueRequest[];
  officers: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  filter: string;
  onFilter: (value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const query = search.trim().toLowerCase();
  const visible = requests.filter(
    (request) =>
      (filter === 'all' ||
        (filter === 'closed'
          ? request.status === 'CLOSED'
          : filter === 'received'
            ? request.status === 'RECEIVED'
            : request.status !== 'CLOSED')) &&
      (!query ||
        request.address.toLowerCase().includes(query) ||
        requestNumber(request.number).toLowerCase().includes(query)),
  );
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
          {requests.length} authorised requests loaded across service pages. Search, filters and
          counts apply to this complete set.
        </p>
        <div className="queue-filters" aria-label="Queue filters">
          {[
            ['active', 'Open', requests.filter((r) => r.status !== 'CLOSED').length],
            ['received', 'Needs dispatch', requests.filter((r) => r.status === 'RECEIVED').length],
            ['all', 'All', requests.length],
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
            Search loaded requests
            <span>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
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
          <h3>No matching requests</h3>
          <p>Change the search or filter to review other loaded requests.</p>
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
                <tr key={request.id} className={selected === request.id ? 'selected' : ''}>
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
          25 per page · Page {currentPage + 1} of {pages} · {visible.length} matching loaded records
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
    </section>
  );
}
