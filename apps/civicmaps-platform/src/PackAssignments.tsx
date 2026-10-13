export function PackAssignments({
  catalogue,
  selected,
  busy,
  loaded,
  onDisable,
  onEnable,
}: {
  catalogue: string[];
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
        Turning off a pack retains its records. This saves control-plane configuration; workflow
        enforcement in CommandMAPS and EnforcementMAPS is pending integration.
      </p>
      <div className="pack-list">
        {catalogue.map((pack) => (
          <div className="pack-row" key={pack}>
            <div>
              <strong>{pack}</strong>
              <small>
                {selected.includes(pack) ? 'Assigned to this council' : 'Available to assign'}
              </small>
            </div>
            <button
              role="switch"
              aria-checked={selected.includes(pack)}
              aria-label={pack}
              disabled={busy || !loaded}
              className={`switch ${selected.includes(pack) ? 'on' : ''}`}
              onClick={() => (selected.includes(pack) ? onDisable(pack) : onEnable(pack))}
            >
              <span />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
