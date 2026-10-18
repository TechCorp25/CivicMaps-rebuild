export async function entitlements(client, actor) {
  await client.query(
    "SELECT set_config('civicmaps.context',$1,true),set_config('civicmaps.actor',$2,true)",
    [actor.context_id, actor.id],
  );
  const state = (await client.query('SELECT civicmaps_entitlement_state() AS state')).rows[0].state;
  const capabilities = [];
  if (state.known && state.operational) {
    capabilities.push('requests.read', 'requests.audit.read');
    if (state.enabled) {
      capabilities.push('officers.read', 'resources.read');
      if (actor.role === 'DISPATCHER')
        capabilities.push('requests.create', 'requests.assign', 'requests.close');
      if (actor.role === 'OFFICER') capabilities.push('requests.acknowledge', 'requests.attend');
    }
  }
  return {
    ...state,
    capabilities,
    mode: !state.known
      ? 'unavailable'
      : !state.operational
        ? 'profile'
        : state.enabled
          ? 'enabled'
          : 'review',
  };
}
export function requireCapability(state, capability) {
  if (!state.capabilities.includes(capability))
    throw Object.assign(
      new Error('This branch capability is unavailable under the current pack configuration'),
      { status: 403 },
    );
}
