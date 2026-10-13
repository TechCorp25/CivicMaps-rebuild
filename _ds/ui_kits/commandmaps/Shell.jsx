/* CommandMAPS — Shell (header + nav) */
const { useState } = React;

function LucideIcon({ name, size = 20, stroke = 2 }) {
  // Minimal inline Lucide SVGs used across the kit
  const paths = {
    LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    Users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    Map: 'M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3zM8 3v15M16 6v15',
    Search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    LogOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Menu: 'M3 6h18M3 12h18M3 18h18',
    Plus: 'M12 5v14M5 12h14',
    ChevronRight: 'M9 18l6-6-6-6',
    ChevronLeft: 'M15 18l-6-6 6-6',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    Bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0',
    User: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Car: 'M7 17h10M5 17l1-6h12l1 6M5 11l1.4-4.2A2 2 0 0 1 8.3 5.5h7.4a2 2 0 0 1 1.9 1.3L19 11M5 11h14v6H5zM7 20v-3M17 20v-3',
    Camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    X: 'M18 6 6 18M6 6l12 12'
  };
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' },
    (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', { key: i, d }))
  );
}

function Header({ page, onPage, user, onLogout, dispatch }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'directory', label: 'Directory', icon: 'Users' },
    { id: 'assignments', label: 'Assignments', icon: 'Map' },
    { id: 'lookup', label: 'Look Up', icon: 'Search' },
    { id: 'audit', label: 'Audit', icon: 'ClipboardList' }
  ];
  const bg = dispatch ? 'var(--civic-secondary-dark)' : 'var(--civic-primary)';
  return React.createElement('header', { style: { background: bg, color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('div', { style: { width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', color: 'var(--civic-accent)' } }, React.createElement(LucideIcon, { name: 'Shield', size: 18, stroke: 2.2 })),
        React.createElement('h1', { style: { margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '.01em' } }, dispatch ? 'CommandMAPS · Dispatch' : 'CommandMAPS')
      ),
      React.createElement('nav', { style: { display: 'flex', gap: 2 } },
        navItems.map(item => React.createElement('button', {
          key: item.id,
          onClick: () => onPage(item.id),
          style: {
            background: page === item.id ? 'rgba(255,255,255,.2)' : 'transparent',
            color: page === item.id ? '#fff' : 'rgba(255,255,255,.7)',
            border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit'
          }
        }, React.createElement(LucideIcon, { name: item.icon, size: 14 }), item.label))
      )
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('span', { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--civic-accent)', padding: '2px 8px', border: '1px solid rgba(212,168,67,.4)', borderRadius: 4, letterSpacing: '.04em' } }, user.dept || 'COMPLIANCE 629'),
      React.createElement('button', { onClick: onLogout, style: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' } }, React.createElement(LucideIcon, { name: 'LogOut', size: 14 }), 'Logout')
    )
  );
}

window.LucideIcon = LucideIcon;
window.Header = Header;
