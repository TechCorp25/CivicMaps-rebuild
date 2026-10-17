// One token namespace covers implemented and reserved products without renaming registry records.
export function municipalityToken(slug, id) {
  if (
    typeof slug !== 'string' ||
    slug.length > 63 ||
    !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    throw new Error('Valid immutable municipality identity required');
  const acceptance = {
    '20000000-0000-4000-8000-000000000001': ['synthetic-alpha', 'alpha'],
    '20000000-0000-4000-8000-000000000002': ['synthetic-beta', 'beta'],
  }[id.toLowerCase()];
  if (acceptance && slug === acceptance[0]) return acceptance[1];
  return slug.length <= 47 && !slug.startsWith('id-') && !['alpha', 'beta'].includes(slug)
    ? slug
    : `id-${id.toLowerCase().replaceAll('-', '')}`;
}

export function municipalityHostname(slug, id, service = 'commandmaps') {
  if (!['commandmaps', 'enforcementmaps', 'report'].includes(service))
    throw new Error('Unknown service naming pattern');
  return `${municipalityToken(slug, id)}-${service}.dev.civicmaps.com.au`;
}
