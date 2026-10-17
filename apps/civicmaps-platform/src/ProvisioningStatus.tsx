import { type ProvisioningJob } from './api';

const labels = {
  queued: 'Queued',
  running: 'Running',
  waiting: 'Waiting to retry',
  failed: 'Failed',
  succeeded: 'Succeeded',
};
const stepLabels: Record<string, string> = {
  prepare_workspace: 'Prepare synthetic workspace',
  prepare_services: 'Prepare synthetic services',
};
export function ProvisioningStatus({
  job,
  busy,
  onRefresh,
  onAction,
}: {
  job: ProvisioningJob | null;
  busy: boolean;
  onRefresh: () => void;
  onAction: (action: 'retry' | 'reconcile') => void;
}) {
  const cloud = job?.adapter === 'aws-postgres-s3';
  return (
    <section className="card provisioning" aria-labelledby="provisioning-heading">
      <div className="section-heading">
        <h2 id="provisioning-heading">Provisioning job</h2>
      </div>
      <p className="local-note">
        {cloud
          ? 'AWS Sydney development resources · Council services are not activated.'
          : 'Synthetic adapter · This simulation does not activate council services.'}
      </p>
      {job ? (
        <>
          <p role="status">
            <strong>{labels[job.state]}</strong> · {job.attempts} worker attempts
          </p>
          <p className="muted">
            Job ID: <code>{job.id}</code>
          </p>
          {job.error && <p className="error">{job.error}</p>}
          {job.state === 'queued' && <p>Waiting for the provisioning worker.</p>}
          {job.state === 'waiting' && (
            <p>
              Next automatic attempt after {new Date(job.available_at).toLocaleString('en-AU')}.
            </p>
          )}
          {job.state === 'running' && job.lease_until && (
            <p>
              If the worker stops, recovery is available after{' '}
              {new Date(job.lease_until).toLocaleString('en-AU')}.
            </p>
          )}
          {job.state === 'succeeded' && (
            <p>
              {cloud
                ? 'Data resources ready. Administrator activation remains pending.'
                : 'Simulation complete. Real infrastructure and admin activation remain pending.'}
            </p>
          )}
          <ol className="provisioning-steps">
            {job.steps.map((step) => (
              <li key={step.name}>
                <strong>
                  {cloud
                    ? step.name === 'prepare_workspace'
                      ? 'Prepare isolated database'
                      : 'Prepare evidence storage'
                    : (stepLabels[step.name] ?? step.name)}
                </strong>
                <span>
                  {step.state} · {step.attempts} attempts
                </span>
                {step.resource_id && <code>{step.resource_id}</code>}
                {step.error && <p>{step.error}</p>}
              </li>
            ))}
          </ol>
          <div className="actions">
            <button className="secondary" disabled={busy} onClick={onRefresh}>
              Refresh job status
            </button>
            {job.can_retry && (
              <button disabled={busy} onClick={() => onAction('retry')}>
                Retry job
              </button>
            )}
            {job.can_reconcile && (
              <button className="secondary" disabled={busy} onClick={() => onAction('reconcile')}>
                Reconcile job
              </button>
            )}
          </div>
          {job.can_reconcile && (
            <p className="muted">
              {cloud
                ? 'Reconcile verifies resource ownership before resuming incomplete steps.'
                : 'Reconcile inspects saved synthetic effects before resuming incomplete steps.'}
            </p>
          )}
        </>
      ) : (
        <p>No provisioning job was requested for this existing registry record.</p>
      )}
    </section>
  );
}
