/* EnforcementMAPS — PTT, Jobs, Profile screens */
const { useState: puS } = React;

function PTTScreen({ onCode1 }) {
  const [trans, setTrans] = puS(false);
  return React.createElement('div', { style: { flex: 1, background: 'var(--civic-primary-dark)', color: '#fff', display: 'flex', flexDirection: 'column', padding: 20 } },
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.6)', fontWeight: 600 } }, 'Active channel'),
      React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 } }, 'Channel 3 · Elizabeth'),
      React.createElement('div', { style: { fontSize: 12, color: 'var(--civic-accent-light)', fontFamily: 'var(--font-mono)', marginTop: 2 } }, '5 officers online')),
    React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: 12, marginBottom: 14 } },
      React.createElement('div', { style: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(255,255,255,.55)', fontWeight: 600, marginBottom: 6 } }, 'Recent traffic'),
      [
        { id: 'PEO-118', t: '14:34', msg: 'Copy that, heading to Elizabeth & Lonsdale now.' },
        { id: 'PEO-089', t: '14:33', msg: 'All clear Carlton North.' },
        { id: 'PCL-142', t: '14:32', msg: 'Ten-four.' }
      ].map((m, i) => React.createElement('div', { key: i, style: { padding: '6px 0', borderTop: i ? '1px solid rgba(255,255,255,.06)' : 'none' } },
        React.createElement('div', { style: { display: 'flex', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--civic-accent-light)' } }, m.id, React.createElement('span', { style: { color: 'rgba(255,255,255,.4)' } }, m.t)),
        React.createElement('div', { style: { fontSize: 13, color: 'rgba(255,255,255,.9)', marginTop: 2 } }, m.msg)))),
    React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 } },
      React.createElement('button', { onMouseDown: () => setTrans(true), onMouseUp: () => setTrans(false), onMouseLeave: () => setTrans(false), onTouchStart: () => setTrans(true), onTouchEnd: () => setTrans(false), style: { width: 220, height: 220, borderRadius: '50%', background: trans ? 'var(--civic-secondary)' : 'var(--civic-primary)', border: `6px solid ${trans ? 'var(--civic-secondary-light)' : 'var(--civic-primary-light)'}`, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: trans ? '0 0 0 12px rgba(35,163,146,.25)' : '0 0 0 6px rgba(44,62,107,.3)', transition: 'all .15s', fontFamily: 'inherit' } },
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement(EmIcon, { name: 'Mic', size: 56, stroke: 1.8 }),
          React.createElement('div', { style: { marginTop: 8, fontSize: 13, fontWeight: 700, letterSpacing: '.06em' } }, trans ? 'TRANSMITTING' : 'HOLD TO TALK'))),
      React.createElement('div', { style: { fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-mono)' } }, trans ? '▌▌▌ LIVE' : 'Press and hold')),
    React.createElement('button', { onClick: onCode1, style: { marginTop: 10, background: 'var(--status-emergency)', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 800, fontSize: 15, letterSpacing: '.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' } }, React.createElement(EmIcon, { name: 'Siren', size: 20, stroke: 2.2 }), 'CODE 1 — BROADCAST SOS')
  );
}

function JobsScreen() {
  const jobs = [
    { sr: 'SR-2026-0418-042', addr: '412 Elizabeth St', type: 'Parking violation', status: 'ACTIVE', time: '14:32' },
    { sr: 'SR-2026-0418-038', addr: '18 Macaulay Rd', type: 'Abandoned vehicle', status: 'COMPLETED', time: '13:40' },
    { sr: 'SR-2026-0418-031', addr: 'Queen Victoria Mkt', type: 'Obstruction', status: 'COMPLETED', time: '12:10' },
    { sr: 'SR-2026-0418-022', addr: '66 Flemington Rd', type: 'Meter overstay', status: 'COMPLETED', time: '10:48' }
  ];
  const badge = { ACTIVE: ['var(--status-alert-bg)', 'var(--status-alert-strong)'], COMPLETED: ['var(--civic-neutral-100)', 'var(--civic-neutral-600)'] };
  return React.createElement('div', { style: { flex: 1, overflow: 'auto', background: 'var(--civic-surface-raised)' } },
    React.createElement('div', { style: { padding: '14px 14px 8px' } },
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        ['Active', 'Today', 'Week'].map((l, i) => React.createElement('button', { key: l, style: { padding: '7px 14px', background: i === 0 ? 'var(--civic-primary)' : '#fff', color: i === 0 ? '#fff' : 'var(--civic-neutral-700)', border: '1px solid ' + (i === 0 ? 'var(--civic-primary)' : 'var(--civic-neutral-200)'), borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' } }, l)))),
    React.createElement('div', { style: { padding: '6px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 } },
      jobs.map(j => React.createElement('div', { key: j.sr, style: { background: '#fff', border: '1px solid var(--civic-neutral-200)', borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--civic-neutral-500)', fontWeight: 600 } }, j.sr),
          React.createElement('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: badge[j.status][0], color: badge[j.status][1], textTransform: 'uppercase', letterSpacing: '.04em' } }, j.status)),
        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, j.addr),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--civic-neutral-500)', marginTop: 2 } }, j.type + ' · ' + j.time),
        j.status === 'ACTIVE' && React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
          React.createElement('button', { style: { flex: 1, background: 'var(--civic-surface-sunken)', color: 'var(--civic-neutral-700)', border: 'none', padding: '8px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' } }, React.createElement(EmIcon, { name: 'Camera', size: 14 }), 'Photo'),
          React.createElement('button', { style: { flex: 1, background: 'var(--civic-accent)', color: 'var(--civic-primary-dark)', border: 'none', padding: '8px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' } }, React.createElement(EmIcon, { name: 'Receipt', size: 14 }), 'Issue infringement'))
      )))
  );
}

function ProfileScreen({ officer, onLogout }) {
  const rows = [
    ['Badge', officer.id], ['Zone', 'Z-MAC · Macaulay'], ['Role', 'Compliance Lead'],
    ['Shift', '07:00 – 15:00'], ['Channel', 'Ch. 3 · Elizabeth'], ['Device', 'Samsung XCover 7']
  ];
  return React.createElement('div', { style: { flex: 1, overflow: 'auto', background: 'var(--civic-surface-raised)' } },
    React.createElement('div', { style: { background: 'var(--civic-primary)', color: '#fff', padding: '20px 18px 28px', textAlign: 'center' } },
      React.createElement('div', { style: { width: 72, height: 72, borderRadius: '50%', background: 'var(--civic-primary-light)', display: 'grid', placeItems: 'center', margin: '0 auto 8px', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 } }, 'SC'),
      React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 } }, officer.name),
      React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--civic-accent-light)', marginTop: 3 } }, officer.id),
      React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(22,163,74,.2)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 } },
        React.createElement('span', { style: { width: 8, height: 8, borderRadius: 99, background: 'var(--status-active)' } }), 'ON PATROL')),
    React.createElement('div', { style: { padding: 14 } },
      React.createElement('div', { style: { background: '#fff', borderRadius: 12, border: '1px solid var(--civic-neutral-200)', overflow: 'hidden' } },
        rows.map((r, i) => React.createElement('div', { key: i, style: { padding: '12px 14px', borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none', display: 'flex', justifyContent: 'space-between' } },
          React.createElement('span', { style: { fontSize: 13, color: 'var(--civic-neutral-500)' } }, r[0]),
          React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--civic-neutral-900)', fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit' } }, r[1])))),
      React.createElement('div', { style: { marginTop: 10, background: '#fff', borderRadius: 12, border: '1px solid var(--civic-neutral-200)' } },
        ['Code 2 · Log lunch break', 'Request zone swap', 'Reset PIN'].map((a, i) => React.createElement('button', { key: i, style: { width: '100%', textAlign: 'left', padding: '14px', background: 'transparent', border: 'none', borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none', fontSize: 13, color: 'var(--civic-neutral-800)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 } }, a))),
      React.createElement('button', { onClick: onLogout, style: { width: '100%', marginTop: 14, background: '#fff', color: 'var(--status-emergency)', border: '1px solid var(--status-emergency-border)', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' } }, 'Sign out')
    )
  );
}

window.PTTScreen = PTTScreen;
window.JobsScreen = JobsScreen;
window.ProfileScreen = ProfileScreen;
