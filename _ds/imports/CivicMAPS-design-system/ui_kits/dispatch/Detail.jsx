/* Dispatch — Code21 detail drawer (lifecycle + actions) */

function LifecycleTrack({ current }) {
  // 11-state lifecycle, server-enforced. Show progress through happy path; branches shown as side states
  const happy = ['RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS', 'ATTENDED', 'PIN_ISSUED', 'COMPLETED'];
  const idx = happy.indexOf(current);
  const onPath = idx !== -1;

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 0 } },
      happy.map((s, i) => {
        const reached = onPath && i <= idx;
        const isCurrent = onPath && i === idx;
        return React.createElement(React.Fragment, { key: s },
          React.createElement('div', { title: s, style: { width: isCurrent ? 16 : 10, height: isCurrent ? 16 : 10, borderRadius: 99, background: reached ? 'var(--civic-secondary)' : 'var(--civic-neutral-200)', border: isCurrent ? '3px solid var(--civic-secondary-light)' : 'none', flexShrink: 0 } }),
          i < happy.length - 1 && React.createElement('div', { style: { flex: 1, height: 2, background: reached && i < idx ? 'var(--civic-secondary)' : 'var(--civic-neutral-200)' } })
        );
      })
    ),
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' } },
      happy.map(s => React.createElement('span', { key: s, style: { textAlign: 'center', flex: 1, color: s === current ? 'var(--civic-secondary-dark)' : 'var(--civic-neutral-400)', fontWeight: s === current ? 700 : 400 } }, s.replace(/_/g, ' ').slice(0, 8)))
    ),
    !onPath && React.createElement('div', { style: { marginTop: 8, padding: '6px 10px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 11, color: 'var(--civic-neutral-700)' } }, 'Branch state: ',
      React.createElement('strong', { style: { fontFamily: 'var(--font-mono)' } }, current))
  );
}

function DetailDrawer({ sr, onClose, onAdvance }) {
  if (!sr) return null;
  const m = STATUS_META[sr.status];
  const meta = [
    ['Priority', sr.priority, true],
    ['Type', sr.type, false],
    ['Zone', sr.zone, true],
    ['Officer', sr.officer || 'Unassigned', true],
    ['ETA', sr.eta, false],
    ['Received', sr.received + ' AEDT', true]
  ];
  // Next action depends on current status (server enforces transitions)
  const next = {
    RECEIVED: { label: 'Dispatch officer', to: 'DISPATCHED_NOT_ACTIVE' },
    DISPATCHED_NOT_ACTIVE: { label: 'Mark active', to: 'DISPATCHED_ACTIVE' },
    DISPATCHED_ACTIVE: { label: 'Mark in progress', to: 'IN_PROGRESS' },
    IN_PROGRESS: { label: 'Mark attended', to: 'ATTENDED' },
    ATTENDED: { label: 'Issue PIN', to: 'PIN_ISSUED' },
    PIN_ISSUED: { label: 'Close', to: 'COMPLETED' }
  }[sr.status];

  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }, onClick: onClose },
    React.createElement('div', { onClick: e => e.stopPropagation(), style: { width: 520, maxWidth: '92%', background: '#fff', height: '100%', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', animation: 'slidein .35s cubic-bezier(.4,0,.2,1)' } },
      React.createElement('div', { style: { padding: '14px 18px', borderBottom: '1px solid var(--civic-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--civic-secondary)' } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--civic-neutral-500)', fontWeight: 600 } }, sr.sr),
          React.createElement('h3', { style: { margin: '2px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, sr.addr)),
        React.createElement('button', { onClick: onClose, style: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--civic-neutral-400)', padding: 4, display: 'grid', placeItems: 'center' } }, React.createElement(DispIcon, { name: 'X', size: 20 }))
      ),
      React.createElement('div', { style: { padding: 18, overflowY: 'auto', flex: 1 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 } },
          React.createElement(PriorityChip, { p: sr.priority }),
          React.createElement(StatusPill, { s: sr.status })),
        React.createElement('div', { style: { background: 'var(--civic-surface-raised)', padding: 14, borderRadius: 10, marginBottom: 16 } },
          React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 } }, 'Lifecycle'),
          React.createElement(LifecycleTrack, { current: sr.status })),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 } },
          meta.map(([k, v, mono], i) => React.createElement('div', { key: i, style: { padding: '8px 10px', background: 'var(--civic-surface-raised)', borderRadius: 6 } },
            React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 } }, k),
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--civic-neutral-900)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', marginTop: 2 } }, v)))),
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 } }, 'Description'),
        React.createElement('div', { style: { padding: '10px 12px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 13, color: 'var(--civic-neutral-700)', lineHeight: 1.5, marginBottom: 16 } },
          'Silver sedan parked across loading zone outside ' + sr.addr + '. Reported by business owner. Plate ',
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--civic-neutral-900)' } }, '1ABC-234'), '.'),
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 } }, 'Routing'),
        React.createElement('div', { style: { padding: '10px 12px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-700)', marginBottom: 16 } },
          'GPS: -37.81423, 144.96326', React.createElement('br'),
          'Distance: 480 m · Walk ETA: 6 min · Drive: 3 min')
      ),
      React.createElement('div', { style: { padding: 14, borderTop: '1px solid var(--civic-neutral-100)', display: 'flex', gap: 8, background: '#fff' } },
        React.createElement('button', { onClick: onClose, style: { background: 'var(--civic-surface-sunken)', color: 'var(--civic-neutral-700)', border: 'none', padding: '10px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Close'),
        React.createElement('button', { style: { background: 'transparent', color: 'var(--status-emergency)', border: '1px solid var(--status-emergency-border)', padding: '10px 14px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Void'),
        React.createElement('div', { style: { flex: 1 } }),
        next && React.createElement('button', { onClick: () => onAdvance(next.to), style: { background: 'var(--civic-secondary-dark)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' } }, next.label, React.createElement(DispIcon, { name: 'ChevronRight', size: 16 }))
      )
    )
  );
}

function CreateSRModal({ onClose, onCreate }) {
  const [addr, setAddr] = dwS('');
  const [pri, setPri] = dwS('P2');
  const [type, setType] = dwS('PARK');
  const field = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--civic-neutral-200)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' };
  const lab = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--civic-neutral-600)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 };

  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'var(--civic-surface-overlay)', display: 'grid', placeItems: 'center', zIndex: 110 }, onClick: onClose },
    React.createElement('div', { onClick: e => e.stopPropagation(), style: { width: 520, maxWidth: '92%', background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-xl)', overflow: 'hidden', borderLeft: '4px solid var(--civic-secondary)' } },
      React.createElement('div', { style: { padding: '14px 18px', borderBottom: '1px solid var(--civic-neutral-100)', display: 'flex', justifyContent: 'space-between' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, 'New Code21 — service request'),
        React.createElement('button', { onClick: onClose, style: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--civic-neutral-400)' } }, React.createElement(DispIcon, { name: 'X', size: 18 }))),
      React.createElement('div', { style: { padding: 18, display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', null, React.createElement('label', { style: lab }, 'Location'), React.createElement('input', { style: field, value: addr, onChange: e => setAddr(e.target.value), placeholder: '412 Elizabeth St, Melbourne VIC' })),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
          React.createElement('div', null, React.createElement('label', { style: lab }, 'Type'),
            React.createElement('select', { style: field, value: type, onChange: e => setType(e.target.value) },
              React.createElement('option', { value: 'PARK' }, 'Parking violation'),
              React.createElement('option', { value: 'OBS' }, 'Obstruction'),
              React.createElement('option', { value: 'ABA' }, 'Abandoned vehicle'),
              React.createElement('option', { value: 'OVR' }, 'Meter overstay'))),
          React.createElement('div', null, React.createElement('label', { style: lab }, 'Priority'),
            React.createElement('select', { style: field, value: pri, onChange: e => setPri(e.target.value) },
              React.createElement('option', { value: 'P1' }, 'P1 — Urgent'),
              React.createElement('option', { value: 'P2' }, 'P2 — Standard'),
              React.createElement('option', { value: 'P3' }, 'P3 — Low')))),
        React.createElement('div', { style: { padding: '10px 12px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 12, color: 'var(--civic-neutral-700)', display: 'flex', gap: 8 } },
          React.createElement(DispIcon, { name: 'MapPin', size: 14 }), 'Server will auto-route to the nearest on-shift officer in the resolved zone.'),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
          React.createElement('button', { onClick: onClose, style: { background: 'transparent', color: 'var(--civic-neutral-600)', border: '1px solid var(--civic-neutral-200)', padding: '9px 14px', borderRadius: 6, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Cancel'),
          React.createElement('button', { onClick: () => onCreate({ addr: addr || '412 Elizabeth St', priority: pri }), style: { background: 'var(--civic-secondary-dark)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Create & dispatch'))
      )
    )
  );
}

window.DetailDrawer = DetailDrawer;
window.CreateSRModal = CreateSRModal;
