/* EnforcementMAPS — Android mobile UI shared components */

const Icon = window.LucideIcon || function Icon({ name, size = 20, stroke = 2 }) {
  const paths = {
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    User: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    Check: 'M20 6 9 17l-5-5',
    X: 'M18 6 6 18M6 6l12 12',
    ChevronLeft: 'M15 18l-6-6 6-6',
    ChevronRight: 'M9 18l6-6-6-6',
    Mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
    Bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Signal: 'M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16',
    Battery: 'M20 17H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zM23 13v-2M7 10v4M11 10v4M15 10v4',
    Wifi: 'M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01',
    Car: 'M7 17h10M5 17l1-6h12l1 6M5 11l1.4-4.2A2 2 0 0 1 8.3 5.5h7.4a2 2 0 0 1 1.9 1.3L19 11M5 11h14v6H5zM7 20v-3M17 20v-3',
    Camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    Receipt: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1zM8 7h8M8 11h8M8 15h5'
  };
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' },
    (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', { key: i, d }))
  );
};

function StatusBar({ time = '14:36', battery = 72 }) {
  return React.createElement('div', { style: { height: 28, background: 'var(--civic-primary-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0 } },
    React.createElement('span', null, time),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement(Icon, { name: 'Signal', size: 12 }),
      React.createElement(Icon, { name: 'Wifi', size: 12 }),
      React.createElement('span', { style: { fontSize: 10 } }, battery + '%'),
      React.createElement(Icon, { name: 'Battery', size: 14 })
    )
  );
}

function AppHeader({ title, subtitle, onBack, right }) {
  return React.createElement('div', { style: { background: 'var(--civic-primary)', color: '#fff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } },
    onBack && React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: 'none', color: '#fff', padding: 4, cursor: 'pointer', display: 'grid', placeItems: 'center' } }, React.createElement(Icon, { name: 'ChevronLeft', size: 22 })),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.2 } }, title),
      subtitle && React.createElement('div', { style: { fontSize: 11, opacity: .8, fontFamily: 'var(--font-mono)' } }, subtitle)),
    right
  );
}

function TabBar({ active, onSelect }) {
  const tabs = [
    { id: 'map', label: 'Patrol', icon: 'MapPin' },
    { id: 'ptt', label: 'PTT', icon: 'Radio' },
    { id: 'jobs', label: 'Jobs', icon: 'ClipboardList' },
    { id: 'profile', label: 'Profile', icon: 'User' }
  ];
  return React.createElement('div', { style: { background: '#fff', borderTop: '1px solid var(--civic-neutral-200)', display: 'flex', height: 64, flexShrink: 0 } },
    tabs.map(t => React.createElement('button', { key: t.id, onClick: () => onSelect(t.id), style: {
      flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
      color: active === t.id ? 'var(--civic-primary)' : 'var(--civic-neutral-400)',
      fontFamily: 'inherit', fontSize: 11, fontWeight: active === t.id ? 600 : 500
    } },
      React.createElement(Icon, { name: t.icon, size: 22, stroke: active === t.id ? 2.2 : 2 }),
      t.label
    ))
  );
}

window.EmIcon = Icon;
window.StatusBar = StatusBar;
window.AppHeader = AppHeader;
window.TabBar = TabBar;
