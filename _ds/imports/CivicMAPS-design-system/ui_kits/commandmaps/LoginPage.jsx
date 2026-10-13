/* CommandMAPS — Login screen */
const { useState: useStateLogin } = React;

export function LoginPage({ onLogin }) {
  const [id, setId] = useStateLogin('samantha.carn@melbourne.vic.gov.au');
  const [pw, setPw] = useStateLogin('patrol2024');
  const [err, setErr] = useStateLogin('');
  const [loading, setLoading] = useStateLogin(false);

  const submit = (e) => {
    e.preventDefault();
    if (!id || !pw) return setErr('Email and password required.');
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ name: 'Samantha Carn', role: 'COMPLIANCE_LEAD' }); }, 500);
  };

  return React.createElement('div', { style: { minHeight: '100%', background: 'var(--civic-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', overflow: 'hidden' } },
    // subtle grid backdrop
    React.createElement('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(44,62,107,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(44,62,107,.35) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: .6 } }),
    React.createElement('div', { style: { position: 'relative', width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, padding: 32, boxShadow: 'var(--shadow-xl)' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 } },
        React.createElement('div', { style: { width: 34, height: 34, borderRadius: 8, background: 'var(--civic-primary)', color: 'var(--civic-accent)', display: 'grid', placeItems: 'center' } }, React.createElement(LucideIcon, { name: 'Shield', size: 20, stroke: 2.2 })),
        React.createElement('h1', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--civic-primary)', letterSpacing: '-.01em' } }, 'CommandMAPS')
      ),
      React.createElement('p', { style: { textAlign: 'center', color: '#636E80', margin: '6px 0 24px', fontSize: 13 } }, 'Admin dispatch dashboard'),
      err && React.createElement('div', { style: { background: 'var(--status-emergency-bg)', color: 'var(--status-emergency)', border: '1px solid var(--status-emergency-border)', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 } }, err),
      React.createElement('form', { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 } }, 'Email or badge number'),
          React.createElement('input', { value: id, onChange: e => setId(e.target.value), style: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--civic-neutral-200)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13 } }),
          React.createElement('div', { style: { fontSize: 11, color: '#636E80', marginTop: 4 } }, 'First login of the day requires email. After that, badge number is accepted.')
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 } }, 'Password'),
          React.createElement('input', { type: 'password', value: pw, onChange: e => setPw(e.target.value), style: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--civic-neutral-200)', borderRadius: 8, fontFamily: 'var(--font-primary)', fontSize: 14 } })
        ),
        React.createElement('button', { type: 'submit', disabled: loading, style: { background: 'var(--civic-primary)', color: '#fff', border: 'none', padding: '11px 0', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .5 : 1 } }, loading ? 'Signing in…' : 'Sign In')
      ),
      React.createElement('div', { style: { marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--civic-neutral-100)', fontSize: 11, color: '#636E80', fontFamily: 'var(--font-mono)', textAlign: 'center' } }, 'DEMO · patrol2024 · any seeded account')
    )
  );
}

window.LoginPage = LoginPage;
