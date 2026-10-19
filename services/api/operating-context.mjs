const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function deny(message) {
  throw Object.assign(new Error(message), { status: 403 });
}
export async function permittedContexts(client, user) {
  await client.query("SELECT set_config('civicmaps.actor',$1,true)", [user.id]);
  // Lock even ineffective rows, then evaluate time after lock acquisition. Revocation waits
  // for an already authorised transaction; the next operation sees the committed change.
  await client.query('SELECT civicmaps_lock_user_contexts($1)', [user.id]);
  const result = await client.query(
    `SELECT b.*,g.effective_from AS grant_from,g.effective_to AS grant_to,g.revoked_at AS grant_revoked
     FROM operating_context_grants g JOIN operating_context_bindings b ON b.id=g.binding_id
     WHERE g.user_id=$1 AND b.municipality_id=$2 AND EXISTS (
       SELECT 1 FROM council_principal_owners o WHERE o.user_id=g.user_id AND o.municipality_id=b.municipality_id
     ) ORDER BY b.id`,
    [user.id, user.owner_municipality_id ?? user.municipality_id],
  );
  // Keep PostgreSQL timestamp precision: JS Date would truncate boundary microseconds.
  const valid = await client.query(
    `WITH instant AS MATERIALIZED (SELECT clock_timestamp() AS at)
    SELECT b.id FROM operating_context_bindings b JOIN operating_context_grants g ON g.binding_id=b.id
    CROSS JOIN instant t WHERE g.user_id=$1 AND b.revoked_at IS NULL AND g.revoked_at IS NULL
    AND b.effective_from<=t.at AND (b.effective_to IS NULL OR b.effective_to>t.at)
    AND b.municipality_id=$2 AND EXISTS(SELECT 1 FROM council_principal_owners o
      WHERE o.user_id=g.user_id AND o.municipality_id=b.municipality_id)
    AND g.effective_from<=t.at AND (g.effective_to IS NULL OR g.effective_to>t.at)`,
    [user.id, user.owner_municipality_id ?? user.municipality_id],
  );
  const ids = new Set(valid.rows.map((row) => row.id));
  return result.rows.filter((binding) => ids.has(binding.id));
}
export async function resolveContext(client, user, selector) {
  if (selector !== undefined && (typeof selector !== 'string' || !uuid.test(selector)))
    deny('Invalid operating context');
  const permitted = await permittedContexts(client, user);
  const selected =
    selector === undefined ? permitted : permitted.filter((b) => b.id === selector.toLowerCase());
  if (selected.length !== 1) deny('Select one permitted operating context');
  const binding = selected[0];
  return {
    ...user,
    tenant_id: binding.tenant_id,
    organisation_id: binding.organisation_id,
    jurisdiction_id: binding.jurisdiction_id,
    data_plane_id: binding.data_plane_id,
    branch_id: binding.branch_id,
    context_id: binding.id,
    context_association_id: binding.association_id,
    context_version: binding.version,
    municipality_id: binding.municipality_id,
  };
}
