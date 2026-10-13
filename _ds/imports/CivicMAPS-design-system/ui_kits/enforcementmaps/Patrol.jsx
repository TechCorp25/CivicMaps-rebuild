/* Authority-Realm content slot (F18) — jurisdiction label is configuration, not code. */
const AUTHORITY_CONTEXT_LABEL = 'Melbourne CBD · Municipal Patrol';

/* EnforcementMAPS — Login & Patrol map screen */
const { useState: uS, useEffect: uE } = React;

function Login({ onLogin }) {
  const [badge, setBadge] = uS('142');
  const [pw, setPw] = uS('patrol2024');
  const [load, setLoad] = uS(false);
  return React.createElement('div', { style: { flex: 1, background: 'var(--civic-primary-dark)', display: 'flex', flexDirection: 'column', padding: 24, color: '#fff' } },
    React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 } },
      React.createElement('div', { style: { width: 64, height: 64, borderRadius: 14, background: 'var(--civic-primary-light)', border: '2px solid var(--civic-accent-light)', boxShadow: '0 0 0 4px rgba(232,196,106,.15)', display: 'grid', placeItems: 'center', color: 'var(--civic-accent-light)', marginBottom: 8 } }, React.createElement(EmIcon, { name: 'Shield', size: 34, stroke: 2 })),
      React.createElement('h1', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 } }, 'EnforcementMAPS'),
      React.createElement('p', { style: { margin: 0, fontSize: 12, color: 'rgba(255,255,255,.85)' } }, AUTHORITY_CONTEXT_LABEL)),
    React.createElement('div', { style: { background: '#fff', color: '#1F2937', borderRadius: 14, padding: 20 } },
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, color: '#4A5568', marginBottom: 6 } }, 'Badge number'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', border: '1px solid var(--civic-neutral-200)', borderRadius: 8, padding: '0 12px' } },
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--civic-neutral-400)', fontSize: 14, marginRight: 2 } }, 'OFC-'),
          React.createElement('input', { value: badge, onChange: e => setBadge(e.target.value.replace(/[^0-9]/g, '')), inputMode: 'numeric', maxLength: 3, style: { flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 16, background: 'transparent' } }))
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, color: '#4A5568', marginBottom: 6 } }, 'Password'),
        React.createElement('input', { type: 'password', value: pw, onChange: e => setPw(e.target.value), style: { width: '100%', boxSizing: 'border-box', border: '1px solid var(--civic-neutral-200)', borderRadius: 8, padding: '12px', fontSize: 14, fontFamily: 'inherit' } })),
      React.createElement('button', { onClick: () => { setLoad(true); setTimeout(() => onLogin({ id: 'PEO-' + badge.padStart(3, '0'), name: 'Samantha Carn', zone: 'Z-MAC' }), 400); }, disabled: load, style: { width: '100%', background: 'var(--civic-primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', opacity: load ? .5 : 1 } }, load ? 'Signing in…' : 'Sign in'),
      React.createElement('div', { style: { textAlign: 'center', marginTop: 12, fontSize: 11, color: '#636E80', fontFamily: 'var(--font-mono)' } }, 'DEMO · badge 142 · patrol2024'))
  );
}

function PatrolMap({ zone, activeJob, onJobTap, onCode1 }) {
  return React.createElement('div', { style: { flex: 1, position: 'relative', background: 'var(--map-canvas-deep)', overflow: 'hidden' } },
    React.createElement('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--map-surface) 1px,transparent 1px),linear-gradient(90deg,var(--map-surface) 1px,transparent 1px)', backgroundSize: '42px 42px', opacity: .55 } }),
    [90, 220, 360, 500].map(t => React.createElement('div', { key: t, style: { position: 'absolute', left: 0, right: 0, top: t, height: 3, background: 'var(--map-road)' } })),
    [50, 170, 290].map(l => React.createElement('div', { key: 'l'+l, style: { position: 'absolute', top: 0, bottom: 0, left: l, width: 3, background: 'var(--map-road)' } })),
    // Assigned zone highlight
    React.createElement('div', { style: { position: 'absolute', left: 30, top: 120, right: 30, bottom: 180, border: '2px solid var(--civic-secondary)', background: 'rgba(26,122,109,.18)', borderRadius: 4 } },
      React.createElement('div', { style: { position: 'absolute', left: 8, top: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#fff', background: 'rgba(0,0,0,.4)', padding: '3px 6px', borderRadius: 4 } }, zone + ' · YOUR ZONE')),
    // Self marker — arrowhead
    React.createElement('div', { style: { position: 'absolute', left: '50%', top: 280, transform: 'translate(-50%,-50%)' } },
      React.createElement('svg', { width: 36, height: 36, viewBox: '0 0 36 36' },
        React.createElement('circle', { cx: 18, cy: 18, r: 17, fill: 'var(--status-active)', fillOpacity: .25 }),
        React.createElement('path', { d: 'M18 4 L28 26 L18 22 L8 26 Z', fill: 'var(--status-active)', stroke: '#fff', strokeWidth: 2, strokeLinejoin: 'round' })),
      React.createElement('div', { style: { position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.5)', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' } }, 'OFC-142')),
    // SR pin
    activeJob && React.createElement('button', { onClick: onJobTap, style: { position: 'absolute', left: '62%', top: 200, transform: 'translate(-50%,-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 } },
      React.createElement('div', { style: { width: 30, height: 30, borderRadius: 6, background: 'var(--status-alert)', border: '2px solid #fff', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, boxShadow: 'var(--shadow-md)' } }, 'SR')),
    // Code 1 SOS trigger — big red bottom-left
    React.createElement('button', { onClick: onCode1, style: { position: 'absolute', right: 14, bottom: 14, width: 72, height: 72, borderRadius: '50%', background: 'var(--status-emergency)', color: '#fff', border: '4px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(220,38,38,.4)', fontFamily: 'inherit' } },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } },
        React.createElement(EmIcon, { name: 'Siren', size: 22, stroke: 2.2 }),
        React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '.06em' } }, 'SOS'))),
    // Zone toggle chip
    React.createElement('div', { style: { position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 8 } },
      React.createElement('div', { style: { flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,.95)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-md)' } },
        React.createElement('span', { style: { width: 10, height: 10, borderRadius: 99, background: 'var(--status-active)' } }),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 11, color: 'var(--civic-neutral-500)', fontWeight: 500 } }, 'On patrol · ' + zone),
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, 'Macaulay'))))
  );
}

function DispatchSheet({ job, onAck, onClose }) {
  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'rgba(17,24,39,.5)', display: 'flex', alignItems: 'flex-end' }, onClick: onClose },
    React.createElement('div', { onClick: e => e.stopPropagation(), style: { width: '100%', background: '#fff', borderRadius: '16px 16px 0 0', padding: 18, animation: 'slideup .35s cubic-bezier(.4,0,.2,1)', boxShadow: 'var(--shadow-xl)' } },
      React.createElement('div', { style: { width: 40, height: 4, background: 'var(--civic-neutral-300)', borderRadius: 99, margin: '0 auto 14px' } }),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
        React.createElement('span', { style: { background: 'var(--status-alert-bg)', color: 'var(--status-alert)', padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: '.04em' } }, 'CODE21 · P2'),
        React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--civic-neutral-500)' } }, job.sr)),
      React.createElement('h3', { style: { margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--civic-neutral-900)' } }, job.address),
      React.createElement('p', { style: { margin: '0 0 12px', fontSize: 13, color: 'var(--civic-neutral-600)', lineHeight: 1.5 } }, job.desc),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
        [['Type', job.type], ['ETA', '3 min walk'], ['Zone', 'Z-ELZ'], ['Dispatched', '14:32']].map(([k, v], i) =>
          React.createElement('div', { key: i, style: { background: 'var(--civic-surface-raised)', padding: '8px 10px', borderRadius: 8 } },
            React.createElement('div', { style: { fontSize: 10, color: 'var(--civic-neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 } }, k),
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--civic-neutral-900)', marginTop: 2 } }, v)))),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement('button', { onClick: onClose, style: { flex: 1, background: 'var(--civic-surface-sunken)', color: 'var(--civic-neutral-700)', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' } }, 'Decline'),
        React.createElement('button', { onClick: onAck, style: { flex: 2, background: 'var(--civic-secondary)', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' } }, React.createElement(EmIcon, { name: 'Check', size: 18, stroke: 2.4 }), 'Acknowledge')
      )
    )
  );
}

window.EmLogin = Login;
window.PatrolMap = PatrolMap;
window.DispatchSheet = DispatchSheet;
