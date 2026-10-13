/* Dispatch — Code21 Dashboard (queue + filters + detail panel)
   Mirrors the repo's Code21Page dashboard: filterable list, opening detail modal.
   Dispatcher-focused — no admin features.
   (Previously named "Workbench" in this design system; renamed to match the
   real application route, which is Dashboard.) */
const { useState: dwS, useEffect: dwE } = React;

const SR_LIFECYCLE = [
  'RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS',
  'ATTENDED', 'PIN_ISSUED', 'NO_REPORT', 'COMPLETED', 'VOIDED', 'CANCELLED', 'CLOSED'
];

const STATUS_META = {
  RECEIVED:               { fg: 'var(--status-pending-strong)', bg: 'var(--status-pending-bg)',   label: 'Received',          icon: 'Inbox' },
  DISPATCHED_NOT_ACTIVE:  { fg: 'var(--status-issued)', bg: 'var(--status-issued-bg)',                    label: 'Dispatched',        icon: 'Clock' },
  DISPATCHED_ACTIVE:      { fg: 'var(--status-alert-strong)', bg: 'var(--status-alert-bg)',     label: 'Dispatched (live)', icon: 'Radio' },
  IN_PROGRESS:            { fg: 'var(--status-active-strong)', bg: 'var(--status-active-bg)',    label: 'In Progress',       icon: 'Radio' },
  ATTENDED:               { fg: 'var(--status-attended)', bg: 'var(--status-attended-bg)',                    label: 'Attended',          icon: 'MapPin' },
  PIN_ISSUED:             { fg: 'var(--status-issued-strong)', bg: 'var(--status-issued-bg)',                    label: 'PIN Issued',        icon: 'ClipboardList' },
  NO_REPORT:              { fg: 'var(--status-issued-deep)', bg: 'var(--status-issued-bg)',                    label: 'No Report',         icon: 'ClipboardList' },
  COMPLETED:              { fg: 'var(--civic-neutral-600)', bg: 'var(--civic-neutral-100)', label: 'Completed', icon: 'ClipboardList' },
  VOIDED:                 { fg: 'var(--status-emergency-deep)', bg: 'var(--status-emergency-bg)', label: 'Voided',            icon: 'X' },
  CANCELLED:              { fg: 'var(--civic-neutral-500)', bg: 'var(--civic-neutral-100)', label: 'Cancelled', icon: 'X' },
  CLOSED:                 { fg: 'var(--civic-neutral-500)', bg: 'var(--civic-neutral-100)', label: 'Closed',    icon: 'ClipboardList' }
};

function StatusPill({ s }) {
  const m = STATUS_META[s] || STATUS_META.RECEIVED;
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: m.bg, color: m.fg, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' } },
    React.createElement(DispIcon, { name: m.icon, size: 11, stroke: 2.4 }),
    m.label
  );
}

const QUEUE = [
  { sr: 'SR-2026-00871', addr: '412 Elizabeth St', zone: 'Z-ELZ', priority: 'P2', status: 'RECEIVED',           officer: null,        eta: '—',     received: '14:32', type: 'Parking violation' },
  { sr: 'SR-2026-00870', addr: '88 Lonsdale St',   zone: 'Z-LON', priority: 'P1', status: 'DISPATCHED_ACTIVE',  officer: 'PEO-118',   eta: '3 min', received: '14:28', type: 'Obstruction' },
  { sr: 'SR-2026-00869', addr: '220 Swanston St',  zone: 'Z-SWM', priority: 'P2', status: 'IN_PROGRESS',        officer: 'PEO-206',   eta: 'on-scene', received: '14:12', type: 'Abandoned vehicle' },
  { sr: 'SR-2026-00868', addr: 'Q.V. Market',      zone: 'Z-MAC', priority: 'P3', status: 'ATTENDED',           officer: 'PCL-142',   eta: 'on-scene', received: '13:55', type: 'Meter overstay' },
  { sr: 'SR-2026-00867', addr: '14 Carlton Pl',    zone: 'Z-CBN', priority: 'P2', status: 'PIN_ISSUED',         officer: 'PEO-089',   eta: '—',     received: '13:40', type: 'Parking violation' },
  { sr: 'SR-2026-00866', addr: '66 Flemington Rd', zone: 'Z-MAC', priority: 'P3', status: 'NO_REPORT',          officer: 'PCL-142',   eta: '—',     received: '13:18', type: 'Meter overstay' },
  { sr: 'SR-2026-00865', addr: '301 Flinders Ln',  zone: 'Z-FLI', priority: 'P2', status: 'COMPLETED',          officer: 'PEO-163',   eta: '—',     received: '12:48', type: 'Parking violation' },
  { sr: 'SR-2026-00864', addr: '5 Bourke St',      zone: 'Z-FLI', priority: 'P3', status: 'CANCELLED',          officer: null,        eta: '—',     received: '12:30', type: 'Obstruction' }
];

function PriorityChip({ p }) {
  const m = { P1: ['var(--status-emergency)', '#fff'], P2: ['var(--status-alert)', 'var(--status-alert-text)'], P3: ['var(--civic-neutral-200)', 'var(--civic-neutral-700)'] }[p];
  return React.createElement('span', { style: { fontFamily: 'var(--font-mono)', background: m[0], color: m[1], fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '.04em' } }, p);
}

function FilterChip({ active, label, count, onClick }) {
  return React.createElement('button', { onClick, style: {
    padding: '6px 12px', borderRadius: 99,
    background: active ? 'var(--civic-secondary-dark)' : '#fff',
    color: active ? '#fff' : 'var(--civic-neutral-700)',
    border: '1px solid ' + (active ? 'var(--civic-secondary-dark)' : 'var(--civic-neutral-200)'),
    fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit'
  } }, label,
    count != null && React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 5px', borderRadius: 99, background: active ? 'rgba(255,255,255,.25)' : 'var(--civic-neutral-100)', color: active ? '#fff' : 'var(--civic-neutral-600)' } }, count)
  );
}

function Dashboard({ onCreate, onOpen }) {
  const [filter, setFilter] = dwS('OPEN');

  const groups = {
    OPEN: ['RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS', 'ATTENDED'],
    ALL: SR_LIFECYCLE,
    NEEDS_DISPATCH: ['RECEIVED'],
    P1: null
  };
  const rows = QUEUE.filter(r => {
    if (filter === 'P1') return r.priority === 'P1';
    return (groups[filter] || SR_LIFECYCLE).includes(r.status);
  });

  return React.createElement('div', { style: { flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--civic-surface-raised)' } },
    React.createElement('div', { style: { flex: 1, padding: 24, overflow: 'auto' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
        React.createElement('div', null,
          React.createElement('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, 'Code21 dashboard'),
          React.createElement('p', { style: { margin: '2px 0 0', color: 'var(--civic-neutral-500)', fontSize: 13 } }, QUEUE.filter(r => groups.OPEN.includes(r.status)).length + ' open · ' + QUEUE.filter(r => r.status === 'RECEIVED').length + ' awaiting dispatch')),
        React.createElement('button', { onClick: onCreate, style: { background: 'var(--civic-secondary-dark)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' } }, React.createElement(DispIcon, { name: 'Plus', size: 16 }), 'New Code21')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' } },
        React.createElement(FilterChip, { active: filter === 'OPEN', onClick: () => setFilter('OPEN'), label: 'Open', count: QUEUE.filter(r => groups.OPEN.includes(r.status)).length }),
        React.createElement(FilterChip, { active: filter === 'NEEDS_DISPATCH', onClick: () => setFilter('NEEDS_DISPATCH'), label: 'Needs dispatch', count: QUEUE.filter(r => r.status === 'RECEIVED').length }),
        React.createElement(FilterChip, { active: filter === 'P1', onClick: () => setFilter('P1'), label: 'P1 urgent', count: QUEUE.filter(r => r.priority === 'P1').length }),
        React.createElement(FilterChip, { active: filter === 'ALL', onClick: () => setFilter('ALL'), label: 'All', count: QUEUE.length })
      ),
      React.createElement('div', { style: { background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRadius: 10, overflow: 'hidden' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { background: 'var(--civic-neutral-100)', textAlign: 'left', fontSize: 11, color: 'var(--civic-neutral-600)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 } },
              ['', 'SR', 'Address', 'Zone', 'Type', 'Status', 'Officer', 'ETA', 'Received'].map((h, i) => React.createElement('th', { key: i, style: { padding: '10px 14px', whiteSpace: 'nowrap' } }, h)))),
          React.createElement('tbody', null,
            rows.map((r, i) => React.createElement('tr', { key: r.sr, onClick: () => onOpen(r), style: { borderTop: '1px solid var(--civic-neutral-100)', background: i % 2 ? 'var(--civic-surface-raised)' : '#fff', cursor: 'pointer' } },
              React.createElement('td', { style: { padding: '10px 14px' } }, React.createElement(PriorityChip, { p: r.priority })),
              React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-secondary-dark)', fontWeight: 700 } }, r.sr),
              React.createElement('td', { style: { padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--civic-neutral-900)' } }, r.addr),
              React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-700)' } }, r.zone),
              React.createElement('td', { style: { padding: '10px 14px', fontSize: 12, color: 'var(--civic-neutral-600)' } }, r.type),
              React.createElement('td', { style: { padding: '10px 14px' } }, React.createElement(StatusPill, { s: r.status })),
              React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-700)' } }, r.officer || '—'),
              React.createElement('td', { style: { padding: '10px 14px', fontSize: 12, color: r.eta === 'on-scene' ? 'var(--status-active)' : 'var(--civic-neutral-600)', fontWeight: r.eta === 'on-scene' ? 600 : 400 } }, r.eta),
              React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-500)' } }, r.received))
            ))
        )
      ),
      React.createElement('div', { style: { marginTop: 10, fontSize: 11, color: 'var(--civic-neutral-500)', fontFamily: 'var(--font-mono)' } }, '25 per page · Page 1 of 1 · Live via WebSocket')
    ),
    // Right activity rail
    React.createElement('aside', { style: { width: 320, background: '#fff', borderLeft: '1px solid var(--civic-neutral-200)', overflow: 'auto', padding: 18, flexShrink: 0 } },
      React.createElement('h3', { style: { margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 } }, 'Live activity'),
      [
        { t: '14:36:02', text: 'PEO-118 acknowledged ', mono: 'SR-2026-00870' },
        { t: '14:35:11', text: 'Channel 3 — roster call complete' },
        { t: '14:34:55', text: 'Z-ELZ reassigned ', mono: 'PR-211 → PEO-118' },
        { t: '14:33:11', text: 'Infringement issued ', mono: 'INF-8841' },
        { t: '14:32:00', text: 'New Code21 ', mono: 'SR-2026-00871' }
      ].map((e, i) => React.createElement('div', { key: i, style: { padding: '10px 0', borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none' } },
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--civic-neutral-400)', marginBottom: 2 } }, e.t),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--civic-neutral-800)' } }, e.text,
          e.mono && React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--civic-secondary-dark)' } }, e.mono))))
    )
  );
}

window.STATUS_META = STATUS_META;
window.SR_LIFECYCLE = SR_LIFECYCLE;
window.StatusPill = StatusPill;
window.PriorityChip = PriorityChip;
window.Dashboard = Dashboard;
// Back-compat alias — older references to Workbench still resolve.
window.Workbench = Dashboard;
