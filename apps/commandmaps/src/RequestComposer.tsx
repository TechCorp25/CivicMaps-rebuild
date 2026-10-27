import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { GoogleLocationPicker } from './GoogleLocationPicker';

export type RequestDraft = { address: string; latitude: number; longitude: number; notes: string };

export function RequestComposer({
  busy,
  error,
  uncertain,
  initialLocation = null,
  onClose,
  onCreate,
}: {
  busy: boolean;
  error: string;
  uncertain: boolean;
  initialLocation?: {
    address: string;
    latitude: number;
    longitude: number;
    source?: 'address' | 'map';
  } | null;
  onClose: () => void;
  onCreate: (draft: RequestDraft) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [review, setReview] = useState(false);
  const [address, setAddress] = useState(initialLocation?.address ?? '');
  const [location, setLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
    source?: 'address' | 'map';
  } | null>(initialLocation);
  const [draft, setDraft] = useState<RequestDraft>({
    address: '',
    latitude: Number.NaN,
    longitude: Number.NaN,
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
    if (!location) return;
    setDraft({
      address: location.address.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
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
            : 'Find the reported address or select its point on the map.'}
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
                {draft.latitude.toFixed(6)}, {draft.longitude.toFixed(6)}
              </dd>
              <dt>Dispatch notes</dt>
              <dd>{draft.notes || 'No notes recorded'}</dd>
            </dl>
            <p className="muted">
              {uncertain
                ? 'The server state was refreshed. Review the queue, then retry the same request only if it is not present.'
                : 'Saving creates an audited request. Officer assignment follows in the request detail.'}
            </p>
            <div className="composer-actions">
              <button
                className="secondary"
                disabled={busy || uncertain}
                onClick={() => setReview(false)}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Edit
              </button>
              <button disabled={busy} onClick={() => onCreate(draft)}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {busy ? 'Saving…' : uncertain ? 'Retry same request' : 'Create request'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={prepare}>
            <GoogleLocationPicker
              address={address}
              onAddressChange={(value) => {
                setAddress(value);
                setLocation((current) =>
                  current?.source === 'map' ? { ...current, address: value } : null,
                );
              }}
              onSelect={setLocation}
              point={location}
            />
            <input type="hidden" name="address" value={location?.address ?? address} />
            {location && (
              <div className="coordinate-fields" aria-label="Confirmed coordinates">
                <label>
                  Latitude
                  <input
                    value={location.latitude.toFixed(6)}
                    readOnly
                    aria-label="Confirmed latitude"
                  />
                </label>
                <label>
                  Longitude
                  <input
                    value={location.longitude.toFixed(6)}
                    readOnly
                    aria-label="Confirmed longitude"
                  />
                </label>
              </div>
            )}
            <label>
              Dispatch notes
              <textarea name="notes" maxLength={2000} rows={3} defaultValue={draft.notes} />
            </label>
            <div className="composer-actions">
              <button className="secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={!location || !location.address.trim()}>
                Review request
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
