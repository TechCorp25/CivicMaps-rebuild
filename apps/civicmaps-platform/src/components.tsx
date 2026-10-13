import { useEffect, useRef, type ReactNode } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

export function Badge({ value }: { value: string }) {
  const tone = ['Active', 'Healthy'].includes(value) ? 'success' : value === 'Degraded' ? 'warning' : value === 'Provisioning' ? 'pending' : 'inactive';
  return <span className={`badge ${tone}`}><span aria-hidden="true" />{value}</span>;
}
export function Brand() { return <span className="brand"><ShieldCheck aria-hidden="true" size={28} /><strong>CivicMAPS</strong><span className="brand-label">Platform</span></span>; }
export function Packs({ catalogue, selected, onChange }: { catalogue: string[]; selected: string[]; onChange: (packs: string[]) => void }) {
  return <div className="pack-grid">{catalogue.map(pack => <label className={`pack-choice ${selected.includes(pack) ? 'chosen' : ''}`} key={pack}>
    <input type="checkbox" checked={selected.includes(pack)} onChange={event => onChange(event.target.checked ? [...selected, pack] : selected.filter(p => p !== pack))} />
    <span>{pack}</span><Check size={18} aria-hidden="true" />
  </label>)}</div>;
}
export function Confirm({ title, children, busy, onCancel, onConfirm }: { title: string; children: ReactNode; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} aria-labelledby="confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <h2 id="confirm-title">{title}</h2>{children}<div className="actions"><button autoFocus className="secondary" disabled={busy} onClick={onCancel}>Cancel</button><button disabled={busy} onClick={onConfirm}>{busy ? 'Saving…' : 'Turn off pack'}</button></div>
  </dialog>;
}
export function Boundary() {
  return <section className="card"><div className="section-heading"><ShieldCheck aria-hidden="true" /><h2>Sandbox boundary</h2></div>
    <p>Each council requires its own database, file storage and session boundaries. Shared application code and domain-pack definitions sit above those boundaries.</p>
    <div className="boundary"><div><strong>Shared platform</strong><span>Application code · Infrastructure · Pack definitions</span></div><div className="boundary-tenants"><div><strong>Council A</strong><span>Database · Files · Sessions</span></div><div><strong>Council B</strong><span>Database · Files · Sessions</span></div></div></div>
    <p className="muted">Target isolation model. This local control plane registers configuration; dedicated tenant schemas, file storage and council session activation are pending.</p>
  </section>;
}
