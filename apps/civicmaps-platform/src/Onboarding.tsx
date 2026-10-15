import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { api, type Onboarding as Input, type ProvisionResult } from './api';
import { Packs } from './components';

export function Onboarding({
  catalogue,
  busy,
  result,
  onSubmit,
  onCancel,
  onView,
}: {
  catalogue: string[];
  busy: boolean;
  result: ProvisionResult | null;
  onSubmit: (input: Input) => void;
  onCancel: () => void;
  onView: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Input>({
    name: '',
    slug: '',
    packs: [],
    firstName: '',
    lastName: '',
    email: '',
  });
  const [availability, setAvailability] = useState('');
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setAvailable(false);
    setAvailability('');
    if (!data.slug) return;
    const controller = new AbortController();
    setAvailability('Checking availability…');
    const timer = setTimeout(() => {
      api<{ available: boolean }>(`/slug-availability?slug=${encodeURIComponent(data.slug)}`, {
        signal: controller.signal,
      })
        .then((result) => {
          if (!controller.signal.aborted) {
            setAvailable(result.available);
            setAvailability(
              result.available ? 'Subdomain is available' : 'This subdomain is already in use',
            );
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) setAvailability(err.message);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [data.slug]);
  function update(key: keyof Input, value: string | string[]) {
    setData((current) => ({ ...current, [key]: value }));
    setError('');
  }
  function next(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (step === 0 && !available) {
      setError('Choose an available subdomain before continuing.');
      return;
    }
    if (step === 1 && !data.packs.length) {
      setError('Select at least one domain pack.');
      return;
    }
    if (step === 3) onSubmit(data);
    else setStep(step + 1);
  }
  if (result)
    return (
      <section className="card wizard success-panel">
        <CheckCircle2 size={44} aria-hidden="true" />
        <p className="eyebrow">Onboarding registered</p>
        <h1>{result.municipality.name}</h1>
        <p>
          Configuration is saved for <strong>{result.municipality.slug}.civicmaps.gov.au</strong>.
          Status: Provisioning.
        </p>
        <p>
          A durable provisioning job is queued. View the municipality to follow its progress and
          resource status. Council service deployment and the first admin's sign-in remain pending.
        </p>
        <div className="credential">
          <h2>First admin · temporary password</h2>
          {result.temporaryPassword ? (
            <>
              <code>{result.temporaryPassword}</code>
              <p>
                Copy this password now. It is shown only in this response and is cleared when you
                leave this page. The account is pending activation.
              </p>
            </>
          ) : (
            <p>
              This onboarding request was already saved. Its temporary password cannot be shown
              again.
            </p>
          )}
        </div>
        <button onClick={() => onView(result.municipality.id)}>
          View municipality
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  const steps = ['Council identity', 'Domain packs', 'First admin', 'Review'];
  return (
    <>
      <button className="text-button" disabled={busy} onClick={onCancel}>
        <ArrowLeft size={16} aria-hidden="true" />
        Municipalities
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Grow the network</p>
          <h1>Add municipality</h1>
          <p>Set up a council's identity, capabilities and first administrator.</p>
        </div>
      </div>
      <section className="card wizard">
        <ol className="steps" aria-label="Onboarding progress">
          {steps.map((label, i) => (
            <li
              key={label}
              className={i === step ? 'current' : i < step ? 'done' : ''}
              aria-current={i === step ? 'step' : undefined}
            >
              <span>{i < step ? '✓' : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <form onSubmit={next}>
          <p className="eyebrow">Step {step + 1} of 4</p>
          <h2>{steps[step]}</h2>
          {step === 0 && (
            <>
              <div className="crest-placeholder">
                <Building2 aria-hidden="true" />
                <span>Council crest · upload planned</span>
              </div>
              <label>
                Council name
                <input
                  autoFocus
                  value={data.name}
                  maxLength={160}
                  required
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. City of Yarra"
                />
              </label>
              <label>
                Subdomain slug
                <div className="slug-input">
                  <input
                    value={data.slug}
                    maxLength={63}
                    pattern="[a-z][a-z0-9]*(-[a-z0-9]+)*"
                    required
                    onChange={(e) => update('slug', e.target.value)}
                    aria-describedby="slug-help slug-status"
                    placeholder="e.g. yarra"
                  />
                  <span>.civicmaps.gov.au</span>
                </div>
              </label>
              <p id="slug-help" className="muted">
                Lowercase letters, numbers and single hyphens. Globally unique and locked once
                registered.
              </p>
              <p id="slug-status" role="status" className={available ? 'availability' : 'muted'}>
                {availability}
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <p>
                Select the domain packs this council operates. Packs can be changed later from the
                municipality overview.
              </p>
              <Packs
                catalogue={catalogue}
                selected={data.packs}
                onChange={(packs) => update('packs', packs)}
              />
            </>
          )}
          {step === 2 && (
            <>
              <p>
                The first administrator is scoped to this council. The server generates a temporary
                password on registration.
              </p>
              <div className="form-grid">
                <label>
                  First name
                  <input
                    autoFocus
                    required
                    maxLength={80}
                    value={data.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                  />
                </label>
                <label>
                  Last name
                  <input
                    required
                    maxLength={80}
                    value={data.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                  />
                </label>
              </div>
              <label>
                Admin email
                <input
                  type="email"
                  required
                  maxLength={200}
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </label>
              <p className="muted">
                Council admin access is pending the tenant identity integration.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <dl className="review">
                <div>
                  <dt>Council identity</dt>
                  <dd>
                    {data.name}
                    <span>{data.slug}.civicmaps.gov.au</span>
                  </dd>
                </div>
                <div>
                  <dt>Domain packs</dt>
                  <dd className="chips">
                    {data.packs.map((pack) => (
                      <span className="chip" key={pack}>
                        {pack}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>First admin</dt>
                  <dd>
                    {data.firstName} {data.lastName}
                    <span>{data.email}</span>
                  </dd>
                </div>
              </dl>
              <div className="info">
                Registering reserves the subdomain and saves the first admin and pack configuration.
                Live tenant infrastructure is a subsequent integration; no public site is created
                here.
              </div>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="wizard-actions">
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => (step ? setStep(step - 1) : onCancel())}
            >
              {step ? 'Back' : 'Cancel'}
            </button>
            <button disabled={busy || (step === 0 && !available)} type="submit">
              {busy ? 'Registering…' : step === 3 ? 'Register municipality' : 'Continue'}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
