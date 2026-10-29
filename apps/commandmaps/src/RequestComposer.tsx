import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { GoogleLocationPicker } from './GoogleLocationPicker';

export type IntakeDestination = { id: string; branchId: string; label: string };
export type RequestDraft = {
  address: string;
  latitude: number;
  longitude: number;
  notes: string;
  destinationContextId: string;
  packageData: { schemaVersion: number; fields: Record<string, string | boolean> };
};

export function RequestComposer({
  busy,
  error,
  uncertain,
  destinations,
  initialLocation = null,
  onClose,
  onCreate,
}: {
  busy: boolean;
  error: string;
  uncertain: boolean;
  destinations: IntakeDestination[];
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
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? '');
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
    destinationContextId: destinations[0]?.id ?? '',
    packageData: { schemaVersion: 1, fields: {} },
  });
  const destination = destinations.find((item) => item.id === destinationId);
  const [branchFields, setBranchFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (destinationId && destinations.some((item) => item.id === destinationId)) return;
    if (destinations[0]) {
      setDestinationId(destinations[0].id);
      setBranchFields({});
    }
  }, [destinations, destinationId]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const modal = dialog.current!;
    modal.showModal();
    return () => {
      modal.close();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [review]);

  function changeDestination(nextId: string) {
    if (
      Object.values(branchFields).some(Boolean) &&
      !window.confirm('Changing the receiving branch clears its branch-specific details. Continue?')
    )
      return;
    setDestinationId(nextId);
    setBranchFields({});
  }

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!location || !destination) return;
    const fields = Object.fromEntries(
      Object.entries(branchFields)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => [key, key === 'hazard' ? value === 'true' : value.trim()]),
    );
    setDraft({
      address: location.address.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      notes: String(form.get('notes') ?? '').trim(),
      destinationContextId: destination.id,
      packageData: { schemaVersion: 1, fields },
    });
    setReview(true);
  }

  const field = (key: string, label: string, required = false, type = 'text', hint?: string) => (
    <label key={key}>
      {label} <span className="muted">({required ? 'Required' : 'Optional'})</span>
      <input
        name={key}
        type={type}
        required={required}
        maxLength={500}
        value={branchFields[key] ?? ''}
        onChange={(event) =>
          setBranchFields((current) => ({ ...current, [key]: event.target.value }))
        }
      />
      {hint && <small className="muted">{hint}</small>}
    </label>
  );

  function renderDepartmentFields() {
    switch (destination?.branchId) {
      case 'parking':
      case 'parking-services':
        return (
          <>
            <label>
              Request type <span className="muted">(Required)</span>
              <select
                required
                value={branchFields.serviceType ?? ''}
                onChange={(event) =>
                  setBranchFields((current) => ({ ...current, serviceType: event.target.value }))
                }
              >
                <option value="">Select request type</option>
                <option value="parking">Parking complaint / alleged offence</option>
              </select>
            </label>
            {field('vehicleColour', 'Vehicle colour', true)}
            {field(
              'allegedOffence',
              'Alleged offence or parking concern',
              true,
              'text',
              'Record the reported allegation; this is not an officer finding.',
            )}
            {field('vehicleMake', 'Vehicle make')}
            {field('vehicleModel', 'Vehicle model')}
            {field('registration', 'Registration or plate')}
          </>
        );
      case 'animal-management':
      case 'animal_management':
        return (
          <>
            {field(
              'reason',
              'Reason or request type',
              true,
              'text',
              'Use the council-approved wording available to your team.',
            )}
            {field('animalType', 'Animal type', true)}
            {field('breed', 'Breed')}
            {field('size', 'Size')}
            {field('colour', 'Colour')}
          </>
        );
      case 'local-laws':
      case 'local_laws': {
        const serviceType = branchFields.serviceType ?? '';
        return (
          <>
            <label>
              Request type <span className="muted">(Required)</span>
              <select
                required
                value={serviceType}
                onChange={(event) => setBranchFields({ serviceType: event.target.value })}
              >
                <option value="">Select request type</option>
                <option value="noise">Noise</option>
                <option value="permits">Permits</option>
                <option value="building">Building</option>
              </select>
            </label>
            {serviceType === 'noise' && (
              <>
                {field('reportedTime', 'Reported or occurred time', false, 'time')}
                <label>
                  Zone type <span className="muted">(Optional)</span>
                  <select
                    value={branchFields.zoneType ?? ''}
                    onChange={(event) =>
                      setBranchFields((current) => ({ ...current, zoneType: event.target.value }))
                    }
                  >
                    <option value="">Unknown / not supplied</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Mixed use</option>
                  </select>
                </label>
                <label>
                  Noise type <span className="muted">(Optional)</span>
                  <select
                    value={branchFields.noiseType ?? ''}
                    onChange={(event) =>
                      setBranchFields((current) => ({ ...current, noiseType: event.target.value }))
                    }
                  >
                    <option value="">Not supplied</option>
                    <option value="music">Music</option>
                    <option value="machinery">Machinery</option>
                    <option value="construction">Construction</option>
                  </select>
                </label>
              </>
            )}
            {serviceType === 'permits' && field('permitReference', 'Permit reference')}
            {serviceType === 'building' &&
              field('description', 'Reported building activity or structure')}
          </>
        );
      }
      case 'waste-management':
      case 'waste_management':
      case 'waste':
      case 'cleaning':
        return (
          <>
            {field(
              'serviceType',
              'Service type (optional)',
              false,
              'text',
              'Examples include illegal dumping, overflowing bin, litter and cleaning; this is not an exhaustive catalogue.',
            )}
            {field('materialType', 'Waste or material type')}
            {field('quantity', 'Approximate size or quantity')}
            <label>
              Hazard reported <span className="muted">(Optional)</span>
              <select
                value={branchFields.hazard ?? ''}
                onChange={(event) =>
                  setBranchFields((current) => ({ ...current, hazard: event.target.value }))
                }
              >
                <option value="">Not recorded</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            {field('reportedTime', 'Reported or occurred time', false, 'time')}
          </>
        );
      default:
        return (
          <p className="error" role="alert">
            This receiving branch has no supported intake form.
          </p>
        );
    }
  }

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
            ? 'Check the receiving branch, reported details and confirmed location before saving.'
            : 'Choose an authorised receiving branch, then record the reported details and confirmed location.'}
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {review ? (
          <>
            <dl className="review-fields">
              <dt>Receiving branch</dt>
              <dd>
                {destinations.find((item) => item.id === draft.destinationContextId)?.label ??
                  'Unavailable'}
              </dd>
              <dt>Request details</dt>
              <dd>
                {Object.entries(draft.packageData.fields)
                  .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`)
                  .join(' · ') || 'No additional branch details'}
              </dd>
              <dt>Location or address</dt>
              <dd>{draft.address}</dd>
              <dt>Coordinates</dt>
              <dd className="mono">
                {draft.latitude.toFixed(6)}, {draft.longitude.toFixed(6)}
              </dd>
              <dt>Dispatch notes</dt>
              <dd>{draft.notes || 'No notes recorded'}</dd>
              <dt>Initial assignment</dt>
              <dd>
                Awaiting assignment: service-area and signed-on duty eligibility are unavailable.
              </dd>
            </dl>
            <p className="muted">
              {uncertain
                ? 'The server state was refreshed. Review the queue, then retry the same request only if it is not present.'
                : 'This request will be retained as Received and unassigned until operational eligibility can be confirmed.'}
            </p>
            <div className="composer-actions">
              <button
                className="secondary"
                disabled={busy || uncertain}
                onClick={() => setReview(false)}
              >
                <ArrowLeft size={18} aria-hidden="true" /> Edit
              </button>
              <button disabled={busy} onClick={() => onCreate(draft)}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {busy ? 'Saving…' : uncertain ? 'Retry same request' : 'Create request'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={prepare}>
            <label>
              Receiving branch <span className="muted">(Authorised destinations)</span>
              <select
                required
                value={destinationId}
                onChange={(event) => changeDestination(event.target.value)}
                disabled={!destinations.length || busy}
              >
                {destinations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {!destinations.length && (
              <p className="error" role="alert">
                No authorised receiving branch has an enabled Code21 intake form.
              </p>
            )}
            {destination && (
              <fieldset className="department-fields">
                <legend>{destination.label} request details</legend>
                {renderDepartmentFields()}
              </fieldset>
            )}
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
              Dispatch notes / additional details <span className="muted">(Optional)</span>
              <textarea name="notes" maxLength={2000} rows={3} defaultValue={draft.notes} />
              <small className="muted">
                Include only information needed to respond. Do not add unnecessary sensitive
                personal details.
              </small>
            </label>
            <div className="composer-actions">
              <button className="secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!location || !location.address.trim() || !destination}
              >
                Review request
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
