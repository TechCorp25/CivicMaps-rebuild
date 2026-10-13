/* CommandMAPS — Modals (New SR / Assign / Code21 detail) */
const { useState: useSt } = React;

function Modal({ title, onClose, children, accent, width = 520 }) {
  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'var(--civic-surface-overlay)', display: 'grid', placeItems: 'center', zIndex: 100 }, onClick: onClose },
    React.createElement('div', { onClick: e => e.stopPropagation(), style: { width, maxWidth: '92%', background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' } },
      React.createElement('div', { style: { padding: '14px 18px', borderBottom: '1px solid var(--civic-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: accent ? `3px solid ${accent}` : 'none' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, title),
        React.createElement('button', { onClick: onClose, style: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--civic-neutral-400)', padding: 4, display: 'grid', placeItems: 'center' } }, React.createElement(LucideIcon, { name: 'X', size: 18 }))
      ),
      React.createElement('div', { style: { padding: 18 } }, children)
    )
  );
}

function NewSRModal({ onClose, onCreate }) {
  const [address, setAddress] = useSt('');
  const [desc, setDesc] = useSt('');
  const [priority, setPriority] = useSt('P2');
  const [type, setType] = useSt('PARK_VIOLATION');
  const field = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid var(--civic-neutral-200)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' };
  const label = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--civic-neutral-600)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 };
  return React.createElement(Modal, { title: 'New Code21 (service request)', onClose, accent: 'var(--civic-primary)' },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      React.createElement('div', null,
        React.createElement('label', { style: label }, 'Location'),
        React.createElement('input', { style: field, value: address, onChange: e => setAddress(e.target.value), placeholder: 'e.g. 412 Elizabeth St' })
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
        React.createElement('div', null,
          React.createElement('label', { style: label }, 'Type'),
          React.createElement('select', { style: field, value: type, onChange: e => setType(e.target.value) },
            React.createElement('option', { value: 'PARK_VIOLATION' }, 'Parking violation'),
            React.createElement('option', { value: 'ABANDONED' }, 'Abandoned vehicle'),
            React.createElement('option', { value: 'OBSTRUCTION' }, 'Obstruction'),
            React.createElement('option', { value: 'OVERSTAY' }, 'Meter overstay'))),
        React.createElement('div', null,
          React.createElement('label', { style: label }, 'Priority'),
          React.createElement('select', { style: field, value: priority, onChange: e => setPriority(e.target.value) },
            React.createElement('option', { value: 'P1' }, 'P1 — Urgent'),
            React.createElement('option', { value: 'P2' }, 'P2 — Standard'),
            React.createElement('option', { value: 'P3' }, 'P3 — Low')))
      ),
      React.createElement('div', null,
        React.createElement('label', { style: label }, 'Description'),
        React.createElement('textarea', { style: { ...field, minHeight: 70, fontFamily: 'inherit', resize: 'vertical' }, value: desc, onChange: e => setDesc(e.target.value), placeholder: 'Vehicle obstructing loading zone…' })
      ),
      React.createElement('div', { style: { padding: '10px 12px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 12, color: 'var(--civic-neutral-600)', display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement(LucideIcon, { name: 'MapPin', size: 14 }), 'Will auto-assign to nearest available officer in zone.'),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 } },
        React.createElement('button', { onClick: onClose, style: { background: 'transparent', color: 'var(--civic-neutral-600)', border: '1px solid var(--civic-neutral-200)', padding: '9px 14px', borderRadius: 6, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Cancel'),
        React.createElement('button', { onClick: () => onCreate({ address: address || '412 Elizabeth St', priority, type }), style: { background: 'var(--civic-primary)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Dispatch'))
    )
  );
}

function AssignModal({ zoneId, onClose, onConfirm }) {
  const officers = [
    { id: 'PCL-142', name: 'Alex Rivera', zone: 'Z-MAC', status: 'active' },
    { id: 'PEO-118', name: 'Darren Wells', zone: 'Z-ELZ', status: 'active' },
    { id: 'PEO-089', name: 'Priya Raghavan', zone: 'Z-CBN', status: 'active' },
    { id: 'PR-211', name: 'Jordan Mikolas', zone: '—', status: 'inactive' },
    { id: 'PEO-124', name: 'Elena Ostroff', zone: 'Z-LON', status: 'active' },
  ];
  return React.createElement(Modal, { title: 'Assign officer to ' + zoneId, onClose },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
      officers.map(o => React.createElement('button', { key: o.id, onClick: () => onConfirm(o), style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--civic-surface-raised)', border: '1px solid var(--civic-neutral-100)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' } },
        React.createElement('span', { style: { width: 10, height: 10, borderRadius: 99, background: o.status === 'active' ? 'var(--status-active)' : 'var(--civic-neutral-300)' } }),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontWeight: 600, fontSize: 13, color: 'var(--civic-neutral-900)' } }, o.name),
          React.createElement('div', { style: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-500)' } }, o.id + ' · currently ' + o.zone)
        ),
        React.createElement('span', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--civic-accent-dark)' } }, 'Select →')
      ))
    )
  );
}

function Code21Detail({ sr, onClose }) {
  return React.createElement(Modal, { title: sr.sr + ' — ' + sr.address, onClose, accent: 'var(--status-alert)' },
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 } },
      ['Status', 'Dispatched'].map((_, i) => null),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 } }, 'Priority'),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, marginTop: 4 } }, 'P2 — Standard')),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 } }, 'Assigned'),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, marginTop: 4 } }, 'PEO-118')),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 } }, 'Received'),
        React.createElement('div', { style: { fontSize: 13, marginTop: 4 } }, '14:32 AEDT')),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 } }, 'Zone'),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 4 } }, 'Z-ELZ · Elizabeth'))
    ),
    React.createElement('div', { style: { padding: '10px 12px', background: 'var(--civic-surface-sunken)', borderRadius: 6, fontSize: 12, color: 'var(--civic-neutral-700)', marginBottom: 14 } },
      'Silver sedan parked across loading zone outside 412 Elizabeth St. Blocking delivery access.'),
    React.createElement('div', { style: { display: 'flex', gap: 8 } },
      React.createElement('button', { onClick: onClose, style: { flex: 1, background: 'var(--civic-surface-sunken)', color: 'var(--civic-neutral-700)', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Reassign'),
      React.createElement('button', { onClick: onClose, style: { flex: 1, background: 'var(--civic-secondary)', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Mark In Progress'))
  );
}

window.NewSRModal = NewSRModal;
window.AssignModal = AssignModal;
window.Code21Detail = Code21Detail;
