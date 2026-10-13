/* Dispatch — Shell (header + nav, teal-accented dispatcher context) */

function DispIcon({ name, size = 20, stroke = 2 }) {
  const paths = {
    LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    Map: 'M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3zM8 3v15M16 6v15',
    Search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    LogOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Plus: 'M12 5v14M5 12h14',
    ChevronRight: 'M9 18l6-6-6-6',
    ChevronLeft: 'M15 18l-6-6 6-6',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Filter: 'M22 3H2l8 9.46V19l4 2v-8.54z',
    Clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    X: 'M18 6 6 18M6 6l12 12',
    Inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    Phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
  };
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' },
    (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', { key: i, d }))
  );
}

function DispHeader({ page, onPage, user, onLogout }) {
  // DISPATCHER role-restricted nav: no Directory, no Audit, no Settings
  const navItems = [
    { id: 'dashboard', label: 'Code21 Dashboard', icon: 'Inbox' },
    { id: 'map', label: 'Live Map', icon: 'LayoutDashboard' },
    { id: 'assignments', label: 'Assignments', icon: 'Map' },
    { id: 'lookup', label: 'Look Up', icon: 'Search' }
  ];
  return React.createElement('header', { style: { background: 'var(--civic-secondary-dark)', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '3px solid var(--civic-secondary)' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('div', { style: { width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', color: 'var(--civic-accent)' } }, React.createElement(DispIcon, { name: 'Radio', size: 18, stroke: 2.2 })),
        React.createElement('div', null,
          React.createElement('h1', { style: { margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '.01em' } }, 'Dispatch'),
          React.createElement('div', { style: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--civic-accent-light)', letterSpacing: '.06em' } }, 'CIVIC MAPS · CH 3 ELIZABETH'))
      ),
      React.createElement('nav', { style: { display: 'flex', gap: 2 } },
        navItems.map(item => React.createElement('button', {
          key: item.id,
          onClick: () => onPage(item.id),
          style: {
            background: page === item.id ? 'rgba(255,255,255,.2)' : 'transparent',
            color: page === item.id ? '#fff' : 'rgba(255,255,255,.75)',
            border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit'
          }
        }, React.createElement(DispIcon, { name: item.icon, size: 14 }), item.label))
      )
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.85)' } },
        React.createElement('span', { style: { width: 8, height: 8, borderRadius: 99, background: 'var(--status-active)', boxShadow: '0 0 0 3px rgba(22,163,74,.25)' } }), 'WS LIVE'),
      React.createElement('span', { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--civic-accent)', padding: '2px 8px', border: '1px solid rgba(212,168,67,.4)', borderRadius: 4, letterSpacing: '.04em' } }, user.dept || 'DISPATCH'),
      React.createElement('button', { onClick: onLogout, style: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' } }, React.createElement(DispIcon, { name: 'LogOut', size: 14 }), 'Sign off')
    )
  );
}

window.DispIcon = DispIcon;
window.DispHeader = DispHeader;
