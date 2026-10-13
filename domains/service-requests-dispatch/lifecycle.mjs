export const statusLabels = {
  RECEIVED: 'Received', DISPATCHED: 'Dispatched (not active)',
  ACKNOWLEDGED: 'Dispatched (active)', ATTENDED: 'Attended', CLOSED: 'Closed'
};
// First foundation slice: infringement and evidence outcomes remain to be built.
export function transition(actor, request, action) {
  if (action === 'assign' && actor.role === 'DISPATCHER' && ['RECEIVED', 'DISPATCHED'].includes(request.status)) return 'DISPATCHED';
  if (action === 'close' && actor.role === 'DISPATCHER' && request.status !== 'CLOSED') return 'CLOSED';
  if (actor.role === 'OFFICER' && request.assigned_officer_id === actor.id) {
    if (action === 'acknowledge' && request.status === 'DISPATCHED') return 'ACKNOWLEDGED';
    if (action === 'attend' && request.status === 'ACKNOWLEDGED') return 'ATTENDED';
  }
  return null;
}
