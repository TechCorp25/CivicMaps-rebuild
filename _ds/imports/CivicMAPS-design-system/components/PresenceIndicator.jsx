/* PresenceIndicator — DR-04 owner-ruled presence badges. Never amber (passive presence). */
export function PresenceIndicator({ state = 'available', size = 'md' }) {
  const META = {
    'available':      { text: 'var(--presence-available)',      bg: 'var(--presence-available-bg)',      border: 'var(--presence-available-border)',      label: 'Available',        icon: 'check' },
    'active-offline': { text: 'var(--presence-active-offline)', bg: 'var(--presence-active-offline-bg)', border: 'var(--presence-active-offline-border)', label: 'Active offline',   icon: 'signal-off' },
    'inactive':       { text: 'var(--presence-inactive)',       bg: 'var(--presence-inactive-bg)',       border: 'var(--presence-inactive-border)',       label: 'Inactive offline', icon: 'moon' }
  };
  const m = META[state] || META.available;
  const s = size === 'sm' ? { fs: 10, pad: '2px 8px', ic: 10 } : { fs: 11, pad: '3px 10px', ic: 12 };
  const paths = {
    'check': <path d="M20 6L9 17l-5-5" />,
    'signal-off': <><path d="M2 20h.01M7 20v-4M12 20v-8" /><path d="M17 20V8M22 4v16" opacity=".3" /><path d="M3 3l18 18" /></>,
    'moon': <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: s.pad, borderRadius: 'var(--radius-full)', background: m.bg, color: m.text, border: `1px solid ${m.border}`, fontSize: s.fs, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontFamily: 'var(--font-primary)' }} aria-label={'Presence: ' + m.label}>
      <svg width={s.ic} height={s.ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[m.icon]}</svg>
      {m.label}
    </span>
  );
}
