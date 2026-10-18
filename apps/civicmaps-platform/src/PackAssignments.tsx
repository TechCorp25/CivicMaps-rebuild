import type { PackOption } from './api';
export function PackAssignments({
  catalogue,
  selected,
  busy,
  loaded,
  onDisable,
  onEnable,
}: {
  catalogue: PackOption[];
  selected: string[];
  busy: boolean;
  loaded: boolean;
  onDisable: (pack: string) => void;
  onEnable: (pack: string) => void;
}) {
  return (
    <section className="card">
      <h2>Domain packs</h2>
      <p>
        Turning off a pack blocks new work. Authorised users can still review retained service
        requests and their audit history. Re-enabling restores permitted access.
      </p>
      <div className="pack-list">
        {catalogue.map((pack) => (
          <div className="pack-row" key={pack.id}>
            <div>
              <strong>{pack.label}</strong>
              <small>
                {selected.includes(pack.id) ? 'Assigned to this council' : 'Available to assign'}
              </small>
            </div>
            <button
              role="switch"
              aria-checked={selected.includes(pack.id)}
              aria-label={pack.label}
              disabled={busy || !loaded}
              className={`switch ${selected.includes(pack.id) ? 'on' : ''}`}
              onClick={() => (selected.includes(pack.id) ? onDisable(pack.id) : onEnable(pack.id))}
            >
              <span />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
