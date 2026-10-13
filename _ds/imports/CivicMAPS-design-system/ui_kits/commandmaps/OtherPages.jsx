/* CommandMAPS — Directory + Audit simple pages */
function DirectoryPage() {
  const rows = [
    { id: 'PCL-142', name: 'Samantha Carn', role: 'COMPLIANCE_LEAD', zone: 'Z-MAC', status: 'active', last: '14:36' },
    { id: 'PEO-118', name: 'Darren Wells', role: 'SUPERVISOR', zone: 'Z-ELZ', status: 'active', last: '14:34' },
    { id: 'PEO-089', name: 'Priya Raghavan', role: 'OFFICER', zone: 'Z-CBN', status: 'active', last: '14:33' },
    { id: 'PR-211', name: 'Jordan Mikolas', role: 'OFFICER', zone: '—', status: 'inactive', last: '12:10' },
    { id: 'PEO-124', name: 'Elena Ostroff', role: 'OFFICER', zone: 'Z-LON', status: 'active', last: '14:35' },
    { id: 'DSP-077', name: 'Marcus Beaufort', role: 'DISPATCH', zone: '—', status: 'active', last: '14:36' },
    { id: 'PEO-206', name: 'Anya Kovacs', role: 'OFFICER', zone: 'Z-SWM', status: 'active', last: '14:34' },
    { id: 'PEO-163', name: 'Rohan Patel', role: 'OFFICER', zone: 'Z-FLI', status: 'active', last: '14:30' }
  ];
  const roleTag = { padding: '2px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '.04em' };
  const roleColor = { COMPLIANCE_LEAD: ['var(--role-lead-bg)', 'var(--role-lead)'], SUPERVISOR: ['var(--role-supervisor-bg)', 'var(--role-supervisor)'], OFFICER: ['var(--role-officer-bg)', 'var(--role-officer)'], DISPATCH: ['var(--role-dispatch-bg)', 'var(--role-dispatch)'] };

  return React.createElement('div', { style: { padding: 24, background: 'var(--civic-surface-raised)', flex: 1, overflow: 'auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      React.createElement('div', null,
        React.createElement('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, 'Directory'),
        React.createElement('p', { style: { margin: '2px 0 0', color: 'var(--civic-neutral-500)', fontSize: 13 } }, '8 officers · 12 online · 2 offline')),
      React.createElement('button', { style: { background: 'var(--civic-primary)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' } }, React.createElement(LucideIcon, { name: 'Plus', size: 14 }), 'Add officer')
    ),
    React.createElement('div', { style: { background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRadius: 10, overflow: 'hidden' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: 'var(--civic-neutral-100)', textAlign: 'left', fontSize: 11, color: 'var(--civic-neutral-600)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 } },
            ['', 'Badge', 'Name', 'Role', 'Assigned zone', 'Last ping'].map((h, i) => React.createElement('th', { key: i, style: { padding: '10px 14px' } }, h)))),
        React.createElement('tbody', null,
          rows.map((r, i) => React.createElement('tr', { key: r.id, style: { borderTop: '1px solid var(--civic-neutral-100)', background: i % 2 ? 'var(--civic-surface-raised)' : '#fff' } },
            React.createElement('td', { style: { padding: '10px 14px', width: 20 } },
              React.createElement('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: r.status === 'active' ? 'var(--status-active)' : 'var(--civic-neutral-300)' } })),
            React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-900)', fontWeight: 600 } }, r.id),
            React.createElement('td', { style: { padding: '10px 14px', fontSize: 13, fontWeight: 500 } }, r.name),
            React.createElement('td', { style: { padding: '10px 14px' } },
              React.createElement('span', { style: { ...roleTag, background: roleColor[r.role][0], color: roleColor[r.role][1] } }, r.role)),
            React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-700)' } }, r.zone),
            React.createElement('td', { style: { padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-500)' } }, r.last))))
      )
    ),
    React.createElement('div', { style: { marginTop: 10, fontSize: 11, color: 'var(--civic-neutral-500)', fontFamily: 'var(--font-mono)' } }, '25 per page · Page 1 of 1')
  );
}

function AuditPage() {
  const events = [
    { t: '14:36:02', actor: 'Samantha Carn', action: 'SR_DISPATCHED', target: 'SR-2026-0418-042', meta: '→ PEO-118' },
    { t: '14:34:55', actor: 'System', action: 'ZONE_REASSIGNED', target: 'Z-ELZ', meta: 'PR-211 → PEO-118' },
    { t: '14:33:11', actor: 'Priya Raghavan', action: 'INFRINGEMENT_ISSUED', target: 'INF-8841', meta: 'AUD 203.51 · Carlton N' },
    { t: '14:30:28', actor: 'Darren Wells', action: 'CODE2_LOGGED', target: 'Z-ELZ', meta: 'Lunch — 30 min' },
    { t: '14:12:10', actor: 'Admin', action: 'ROLE_CHANGED', target: 'PEO-124', meta: 'OFFICER → SUPERVISOR' },
    { t: '13:58:00', actor: 'Marcus Beaufort', action: 'SR_CREATED', target: 'SR-2026-0418-041', meta: 'Elizabeth St' }
  ];
  const actionColor = {
    SR_DISPATCHED: 'var(--status-alert)', ZONE_REASSIGNED: 'var(--status-pending)', INFRINGEMENT_ISSUED: 'var(--status-issued)',
    CODE2_LOGGED: 'var(--status-active)', ROLE_CHANGED: 'var(--civic-accent-dark)', SR_CREATED: 'var(--civic-primary)'
  };
  return React.createElement('div', { style: { padding: 24, background: 'var(--civic-surface-raised)', flex: 1, overflow: 'auto' } },
    React.createElement('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, 'Audit activity'),
    React.createElement('p', { style: { margin: '2px 0 16px', color: 'var(--civic-neutral-500)', fontSize: 13 } }, 'Tuesday 18 April 2026 · AEDT'),
    React.createElement('div', { style: { background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRadius: 10 } },
      events.map((e, i) => React.createElement('div', { key: i, style: { padding: '12px 16px', display: 'grid', gridTemplateColumns: '86px 1fr 220px', gap: 12, alignItems: 'center', borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none' } },
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-neutral-500)' } }, e.t),
        React.createElement('div', null,
          React.createElement('span', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', padding: '2px 8px', borderRadius: 99, background: 'var(--civic-surface-sunken)', color: actionColor[e.action] || 'var(--civic-neutral-700)', marginRight: 8 } }, e.action.replace(/_/g, ' ')),
          React.createElement('span', { style: { fontSize: 13, color: 'var(--civic-neutral-900)', fontWeight: 500 } }, e.actor), ' ',
          React.createElement('span', { style: { fontSize: 12, color: 'var(--civic-neutral-500)' } }, 'on '),
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--civic-primary)' } }, e.target)),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--civic-neutral-500)', textAlign: 'right' } }, e.meta)
      ))
    )
  );
}

window.DirectoryPage = DirectoryPage;
window.AuditPage = AuditPage;
