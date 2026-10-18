import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';

export type RequestDraft = { address: string; latitude: number; longitude: number; notes: string };

export function RequestComposer({
  busy,
  error,
  onClose,
  onCreate,
}: {
  busy: boolean;
  error: string;
  onClose: () => void;
  onCreate: (draft: RequestDraft) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [review, setReview] = useState(false);
  const [draft, setDraft] = useState<RequestDraft>({
    address: '',
    latitude: 0,
    longitude: 0,
    notes: '',
  });
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const modal = dialog.current!;
    modal.showModal();
    return () => {
      modal.close();
      previous?.focus();
    };
  }, []);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setDraft({
      address: String(form.get('address')).trim(),
      latitude: Number(form.get('latitude')),
      longitude: Number(form.get('longitude')),
      notes: String(form.get('notes')),
    });
    setReview(true);
  }
  useEffect(() => {
    heading.current?.focus();
  }, [review]);
  return (
    <dialog
      ref={dialog}
      className="request-composer civic-modal-surface"
      aria-labelledby="composer-title"
      aria-describedby="composer-help"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="panel-heading">
        <h2 id="composer-title" ref={heading} tabIndex={-1}>
          {review ? 'Review service request' : 'New service request'}
        </h2>
        <button
          className="icon-button"
          aria-label="Dismiss new request"
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="composer-body">
        <p id="composer-help" className="muted">
          {review
            ? 'Check the reported location and notes before saving.'
            : 'Enter the reported location and its coordinates.'}
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {review ? (
          <>
            <dl className="review-fields">
              <dt>Location or address</dt>
              <dd>{draft.address}</dd>
              <dt>Coordinates</dt>
              <dd className="mono">
                {draft.latitude}, {draft.longitude}
              </dd>
              <dt>Dispatch notes</dt>
              <dd>{draft.notes || 'No notes recorded'}</dd>
            </dl>
            <p className="muted">
              Saving creates an audited request. Officer assignment follows in the request detail.
            </p>
            <div className="composer-actions">
              <button className="secondary" disabled={busy} onClick={() => setReview(false)}>
                <ArrowLeft size={18} aria-hidden="true" />
                Edit
              </button>
              <button disabled={busy} onClick={() => onCreate(draft)}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {busy ? 'Saving…' : 'Create request'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={prepare}>
            <label>
              Location or address
              <input
                name="address"
                required
                pattern=".*\S.*"
                maxLength={250}
                defaultValue={draft.address}
                placeholder="Enter the reported location"
              />
            </label>
            <div className="coordinate-fields">
              <label>
                Latitude
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  defaultValue={draft.address ? draft.latitude : ''}
                  required
                />
              </label>
              <label>
                Longitude
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  defaultValue={draft.address ? draft.longitude : ''}
                  required
                />
              </label>
            </div>
            <label>
              Dispatch notes
              <textarea name="notes" maxLength={2000} rows={3} defaultValue={draft.notes} />
            </label>
            <div className="composer-actions">
              <button className="secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit">Review request</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
