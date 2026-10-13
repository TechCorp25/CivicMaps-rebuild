/* LifecycleStatusPill — 11-state SR lifecycle promoted out of the dispatch kit (F20).
   Production flow (owner microcopy): Received → Dispatched · Not Active (push sent to
   handset) → Dispatched · Active (push opened/acknowledged) → In Progress → Attended,
   then FORKS: no offence observed → No Report → SR Closed → Completed;
   offence observed → PIN Issued → SR Closed → Completed.
   Consumes semantic status tokens only. Triple-encoded: colour + icon + text. */
export function LifecycleStatusPill({ status = 'RECEIVED' }) {
  const META = {
    RECEIVED:              { fg: 'var(--status-pending-strong)',  bg: 'var(--status-pending-bg)',   label: 'Received',          icon: 'inbox' },
    DISPATCHED_NOT_ACTIVE: { fg: 'var(--status-issued)',          bg: 'var(--status-issued-bg)',    label: 'Dispatched · Not Active',        icon: 'clock' },
    DISPATCHED_ACTIVE:     { fg: 'var(--status-alert-strong)',    bg: 'var(--status-alert-bg)',     label: 'Dispatched · Active', icon: 'radio' },
    IN_PROGRESS:           { fg: 'var(--status-active-strong)',   bg: 'var(--status-active-bg)',    label: 'In Progress',       icon: 'radio' },
    ATTENDED:              { fg: 'var(--status-attended)',        bg: 'var(--status-attended-bg)',  label: 'Attended',          icon: 'pin' },
    PIN_ISSUED:            { fg: 'var(--status-issued-strong)',   bg: 'var(--status-issued-bg)',    label: 'PIN Issued',        icon: 'clipboard' },
    NO_REPORT:             { fg: 'var(--status-issued-deep)',     bg: 'var(--status-issued-bg)',    label: 'No Report',         icon: 'clipboard' },
    COMPLETED:             { fg: 'var(--civic-neutral-600)',      bg: 'var(--civic-neutral-100)',   label: 'Completed',         icon: 'clipboard' },
    VOIDED:                { fg: 'var(--status-emergency-deep)',  bg: 'var(--status-emergency-bg)', label: 'Voided',            icon: 'x' },
    CANCELLED:             { fg: 'var(--civic-neutral-500)',      bg: 'var(--civic-neutral-100)',   label: 'Cancelled',         icon: 'x' },
    CLOSED:                { fg: 'var(--civic-neutral-500)',      bg: 'var(--civic-neutral-100)',   label: 'Closed',            icon: 'clipboard' }
  };
  const m = META[status] || META.RECEIVED;
  const paths = {
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    radio: <><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: m.bg, color: m.fg, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontFamily: 'var(--font-primary)' }} aria-label={'Status: ' + m.label}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[m.icon]}</svg>
      {m.label}
    </span>
  );
}
