/* RadioCodeBadge — tier-driven presentation (DR-04). Progressive disclosure (owner ruling):
   code renders as primary with label HIDDEN; tap/click/touch expands to reveal the paired label.
   Codes are configurable content (S01-COD-001) — never hard-coded semantics here. */
const { useState: rcbUseState } = React;
export function RadioCodeBadge({ code, label, tier = 'work', defaultExpanded = false }) {
  const [open, setOpen] = rcbUseState(defaultExpanded);
  const TIERS = {
    emergency:  { bg: 'var(--status-emergency)',      text: '#fff',                           border: 'var(--status-emergency)' },
    urgent:     { bg: 'var(--status-emergency-bg)',   text: 'var(--status-emergency-text)',   border: 'var(--status-emergency-border)' },
    directive:  { bg: 'var(--civic-primary)',         text: '#fff',                           border: 'var(--civic-primary-light)' },
    'alert-interactive': { bg: 'var(--semantic-alert-interactive)', text: 'var(--status-alert-text)', border: 'var(--semantic-alert-interactive)' },
    presence:   { bg: 'var(--presence-available-bg)', text: 'var(--presence-available)',      border: 'var(--presence-available-border)' },
    comms:      { bg: 'var(--status-pending-bg)',     text: 'var(--status-pending-strong)',   border: 'var(--status-pending-border)' },
    work:       { bg: 'var(--civic-neutral-100)',     text: 'var(--civic-neutral-700)',       border: 'var(--civic-neutral-200)' }
  };
  const t = TIERS[tier] || TIERS.work;
  return (
    <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={code + (open ? '' : ': ' + label + ' (tap to reveal)')}
      style={{ display: 'inline-flex', alignItems: 'center', padding: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)', border: `1px solid ${t.border}`, overflow: 'hidden', background: 'var(--civic-surface)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, letterSpacing: '.05em', minHeight: 26 }}>
      <span style={{ background: t.bg, color: t.text, padding: '4px 8px', display: 'inline-flex', alignItems: 'center' }}>{code}</span>
      {open && <span style={{ color: 'var(--civic-neutral-800)', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: 11, letterSpacing: '.01em', padding: '0 9px', textTransform: 'none', whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}
