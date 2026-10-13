export type Actor = { id: string; name: string; email: string };
export type Municipality = {
  id: string; name: string; slug: string; status: 'Active' | 'Provisioning' | 'Suspended';
  packs: string[]; version: number; created_at: string; first_name: string; last_name: string;
  admin_email: string; activation_state: string; health: 'Healthy' | 'Degraded' | 'Not yet live';
  officers_online: number | null; officers_today: number | null; code21_7d: number | null;
  signal: string | null; degraded_since: string | null; observed_at: string | null; source: string | null;
};
export type Detail = { municipality: Municipality; workloads: { pack: string; open_count: number }[]; events: { id: number; action: string; details: { pack?: string }; created_at: string }[] };
export type Onboarding = { name: string; slug: string; packs: string[]; firstName: string; lastName: string; email: string };
export type ProvisionResult = { municipality: Municipality; temporaryPassword?: string; replayed?: boolean; infrastructure: string };
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/platform${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.error ?? 'The operation could not be completed');
  return data;
}
export const date = (value: string) => new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeZone: 'Australia/Melbourne' }).format(new Date(value));
export const number = (value: number | null) => value === null ? '—' : new Intl.NumberFormat('en-AU').format(value);
