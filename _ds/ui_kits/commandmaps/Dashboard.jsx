/* CommandMAPS — Map + right panel (dashboard body) */
const { useState: useS, useEffect: useE } = React;

function MapCanvas({ onCode21Click, alertCode }) {
  const zones = [
    { id: 'MAC', x: 180, y: 140, w: 170, h: 110, label: 'Z-MAC · Macaulay', dashed: false },
    { id: 'ELZ', x: 380, y: 140, w: 170, h: 110, label: 'Z-ELZ · Elizabeth', dashed: true },
    { id: 'CBN', x: 580, y: 140, w: 170, h: 110, label: 'Z-CBN · Carlton N', dashed: false },
    { id: 'SWM', x: 180, y: 280, w: 170, h: 110, label: 'Z-SWM · Swanston M', dashed: false },
    { id: 'LON', x: 380, y: 280, w: 170, h: 110, label: 'Z-LON · Lonsdale', dashed: false },
    { id: 'FLI', x: 580, y: 280, w: 170, h: 110, label: 'Z-FLI · Flinders', dashed: true }
  ];
  const officers = [
    { x: 250, y: 175, n: '142', alert: false },
    { x: 460, y: 180, n: '118', alert: !!alertCode },
    { x: 640, y: 195, n: '089', alert: false },
    { x: 250, y: 320, n: '211', alert: false },
    { x: 460, y: 330, n: '124', alert: false }
  ];
  const srs = [
    { x: 520, y: 220, status: 'DISPATCHED' },
    { x: 320, y: 380, status: 'RECEIVED' }
  ];
  const roadsH = [120, 260, 400, 540].map(t => React.createElement('div', { key: 't'+t, style: { position: 'absolute', left: 0, right: 0, top: t, height: 3, background: 'var(--map-road)' } }));
  const roadsV = [160, 360, 560, 760].map(l => React.createElement('div', { key: 'l'+l, style: { position: 'absolute', top: 0, bottom: 0, left: l, width: 3, background: 'var(--map-road)' } }));
  const zoneEls = zones.map(z => React.createElement('div', { key: z.id, style: { position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, border: `2px ${z.dashed ? 'dashed' : 'solid'} var(--civic-secondary)`, background: 'rgba(26,122,109,.15)', borderRadius: 4, color: '#fff', fontSize: 10, fontFamily: 'var(--font-mono)', padding: 6 } }, z.label));
  const officerEls = officers.map((o, i) => React.createElement('div', { key: 'o'+i, style: { position: 'absolute', left: o.x, top: o.y, width: 28, height: 28, borderRadius: '50%', background: o.alert ? 'var(--status-emergency)' : 'var(--status-active)', border: '2px solid #fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', fontWeight: 700, boxShadow: o.alert ? '0 0 0 8px rgba(220,38,38,.3)' : '0 0 0 4px rgba(22,163,74,.2)', transform: 'translate(-50%,-50%)' } }, o.n));
  const srEls = srs.map((s, i) => React.createElement('div', { key: 's'+i, onClick: () => onCode21Click && onCode21Click(), style: { position: 'absolute', left: s.x, top: s.y, transform: 'translate(-50%,-50%)', cursor: 'pointer' } },
    React.createElement('div', { style: { width: 22, height: 22, borderRadius: 4, background: s.status === 'RECEIVED' ? 'var(--status-pending)' : 'var(--status-alert)', border: '2px solid #fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#fff', fontWeight: 700 } }, 'SR')
  ));
  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'var(--map-canvas-deep)', overflow: 'hidden' } },
    React.createElement('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--map-surface) 1px,transparent 1px),linear-gradient(90deg,var(--map-surface) 1px,transparent 1px)', backgroundSize: '48px 48px', opacity: .5 } }),
    ...roadsH, ...roadsV, ...zoneEls, ...officerEls, ...srEls,
    React.createElement('div', { key: 'cred', style: { position: 'absolute', bottom: 12, left: 12, padding: '6px 10px', background: 'rgba(15,26,50,.85)', color: '#F7F8FA', fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 6 } }, '© Melbourne CBD · Map ID aadaf0ce47fb616839a32e81')
  );
}

function Tile({ label, value, color }) {
  return React.createElement('div', { style: { background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRadius: 10, padding: '10px 12px' } },
    React.createElement('div', { style: { fontSize: 11, color: 'var(--civic-neutral-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 } }, label),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement('span', { style: { width: 8, height: 8, borderRadius: 99, background: color } }),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color: 'var(--civic-neutral-900)' } }, value)
    )
  );
}

function StatusBadge({ status }) {
  const map = {
    RECEIVED: ['var(--status-pending-bg)', 'var(--status-pending)', 'Received'],
    DISPATCHED_ACTIVE: ['var(--status-alert-bg)', 'var(--status-alert-strong)', 'Dispatched'],
    IN_PROGRESS: ['var(--status-active-bg)', 'var(--status-active-strong)', 'In Progress'],
    COMPLETED: ['var(--civic-neutral-100)', 'var(--civic-neutral-600)', 'Completed']
  };
  const [bg, fg, label] = map[status] || map.RECEIVED;
  return React.createElement('span', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', padding: '3px 8px', borderRadius: 99, background: bg, color: fg } }, label);
}

function DashboardPanel({ open, onToggle, onNewSR, code21s, zones, onAssign }) {
  return React.createElement('div', { style: { position: 'absolute', right: 0, top: 0, height: '100%', width: 360, display: 'flex', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .35s cubic-bezier(.4,0,.2,1)' } },
    React.createElement('button', { onClick: onToggle, style: { position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', width: 28, height: 72, background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRight: 'none', borderRadius: '10px 0 0 10px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--civic-neutral-500)', boxShadow: 'var(--shadow-md)' } }, React.createElement(LucideIcon, { name: open ? 'ChevronRight' : 'ChevronLeft', size: 16 })),
    React.createElement('div', { style: { flex: 1, background: '#fff', borderLeft: '1px solid var(--civic-neutral-200)', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 } },
        React.createElement(Tile, { label: 'Active zones', value: '14/17', color: 'var(--status-pending)' }),
        React.createElement(Tile, { label: 'Online officers', value: '12/14', color: 'var(--status-active)' }),
        React.createElement(Tile, { label: 'Code 2 logged', value: '9', color: 'var(--status-issued)' }),
        React.createElement(Tile, { label: 'Unassigned C21', value: '3', color: 'var(--status-emergency)' })
      ),
      React.createElement('div', { style: { padding: '0 14px 8px' } },
        React.createElement('button', { onClick: onNewSR, style: { width: '100%', background: 'var(--civic-primary)', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' } }, React.createElement(LucideIcon, { name: 'Plus', size: 16 }), 'New Code21 (SR)')
      ),
      React.createElement('div', { style: { padding: '10px 14px 4px' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em' } }, 'Zone assignments')
      ),
      React.createElement('div', { style: { padding: '6px 14px', display: 'flex', flexDirection: 'column', gap: 6 } },
        zones.map(z => React.createElement('div', { key: z.id, style: { background: 'var(--civic-surface-raised)', borderRadius: 8, padding: '8px 10px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 } },
              React.createElement('span', { style: { width: 8, height: 8, borderRadius: 99, background: z.color } }),
              React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--civic-neutral-800)' } }, z.name)
            ),
            z.officer ? React.createElement('span', { style: { width: 8, height: 8, borderRadius: 99, background: z.online ? 'var(--status-active)' : 'var(--civic-neutral-300)' } }) : null
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 } },
            z.officer
              ? React.createElement('span', { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-500)' } }, z.officer)
              : React.createElement('span', { style: { fontSize: 11, color: 'var(--status-alert-strong)', fontWeight: 600 } }, 'Unassigned'),
            React.createElement('button', { onClick: () => onAssign(z.id), style: { fontSize: 10, background: z.officer ? 'var(--status-pending-bg)' : 'var(--status-active-bg)', color: z.officer ? 'var(--status-pending)' : 'var(--status-active)', border: 'none', padding: '3px 8px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' } }, z.officer ? 'Reassign' : 'Assign')
          )
        ))
      ),
      React.createElement('div', { style: { padding: '14px 14px 6px' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em' } }, 'Recent Code21s')
      ),
      React.createElement('div', { style: { padding: '6px 14px 18px', display: 'flex', flexDirection: 'column', gap: 6 } },
        code21s.map(c => React.createElement('div', { key: c.id, style: { background: 'var(--civic-surface-raised)', borderRadius: 8, padding: '8px 10px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 } },
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--civic-neutral-800)' } }, c.address),
            React.createElement(StatusBadge, { status: c.status })
          ),
          React.createElement('div', { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-500)', marginTop: 3 } }, c.sr + ' · ' + c.time)
        ))
      )
    )
  );
}

window.MapCanvas = MapCanvas;
window.DashboardPanel = DashboardPanel;
window.StatusBadge = StatusBadge;
