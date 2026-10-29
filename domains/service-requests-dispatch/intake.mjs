const definitions = {
  parking: {
    label: 'Parking',
    version: 1,
    fields: [
      'serviceType',
      'vehicleColour',
      'allegedOffence',
      'vehicleMake',
      'vehicleModel',
      'registration',
    ],
    required: ['serviceType', 'vehicleColour', 'allegedOffence'],
    types: ['parking'],
  },
  'animal-management': {
    label: 'Animal Management',
    version: 1,
    fields: ['reason', 'animalType', 'breed', 'size', 'colour'],
    required: ['reason', 'animalType'],
  },
  'local-laws': {
    label: 'Local Laws',
    version: 1,
    fields: [
      'serviceType',
      'reportedTime',
      'zoneType',
      'noiseType',
      'permitReference',
      'description',
    ],
    required: ['serviceType'],
    types: ['noise', 'permits', 'building'],
    fieldsByType: {
      noise: ['serviceType', 'reportedTime', 'zoneType', 'noiseType'],
      permits: ['serviceType', 'permitReference'],
      building: ['serviceType', 'description'],
    },
  },
  'waste-management': {
    label: 'Waste Management & Cleaning',
    version: 1,
    fields: ['serviceType', 'materialType', 'quantity', 'hazard', 'reportedTime', 'description'],
    required: [],
    examples: ['illegal dumping', 'overflowing bin', 'litter', 'cleaning'],
  },
};

const aliases = new Map([
  ['parking', 'parking'],
  ['parking-services', 'parking'],
  ['animal-management', 'animal-management'],
  ['animal_management', 'animal-management'],
  ['local-laws', 'local-laws'],
  ['local_laws', 'local-laws'],
  ['waste-management', 'waste-management'],
  ['waste_management', 'waste-management'],
  ['waste', 'waste-management'],
  ['cleaning', 'waste-management'],
]);
const zoneTypes = ['Residential', 'Commercial', 'Mixed use'];
const noiseTypes = ['music', 'machinery', 'construction'];

export function intakeDefinition(branchId) {
  const key = aliases.get(String(branchId).toLowerCase());
  return key ? { key, ...definitions[key] } : null;
}

export function validateIntake(branchId, value) {
  const definition = intakeDefinition(branchId);
  if (!definition)
    throw Object.assign(new Error('This branch has no configured intake form'), { status: 403 });
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    value.schemaVersion !== definition.version ||
    !value.fields ||
    typeof value.fields !== 'object' ||
    Array.isArray(value.fields)
  )
    throw Object.assign(new Error('Refresh the request form before submitting'), { status: 409 });
  if (Object.keys(value).some((key) => !['schemaVersion', 'fields'].includes(key)))
    throw Object.assign(new Error('Request details contain an unsupported field'), { status: 400 });
  const fields = value.fields;
  if (Object.keys(fields).some((key) => !definition.fields.includes(key)))
    throw Object.assign(new Error('Request details contain an unsupported field'), { status: 400 });
  for (const [key, item] of Object.entries(fields)) {
    if (key === 'hazard') {
      if (typeof item !== 'boolean')
        throw Object.assign(new Error('Hazard must be selected as yes or no'), { status: 400 });
    } else if (typeof item !== 'string' || item.length > 500 || item.trim() !== item) {
      throw Object.assign(
        new Error('Request details must be trimmed text of at most 500 characters'),
        { status: 400 },
      );
    }
  }
  if (definition.types && fields.serviceType && !definition.types.includes(fields.serviceType))
    throw Object.assign(new Error('Select a supported request type'), { status: 400 });
  const typeFields = definition.fieldsByType?.[fields.serviceType];
  if (typeFields && Object.keys(fields).some((key) => !typeFields.includes(key)))
    throw Object.assign(new Error('Request details contain fields for another request type'), {
      status: 400,
    });
  if (fields.zoneType && !zoneTypes.includes(fields.zoneType))
    throw Object.assign(new Error('Select a supported zone type'), { status: 400 });
  if (fields.noiseType && !noiseTypes.includes(fields.noiseType))
    throw Object.assign(new Error('Select a supported noise type'), { status: 400 });
  if (definition.required.some((key) => typeof fields[key] !== 'string' || !fields[key].trim()))
    throw Object.assign(new Error('Complete the required branch-specific request details'), {
      status: 400,
    });
  if (fields.reportedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.reportedTime))
    throw Object.assign(new Error('Reported time must use 24-hour HH:MM format'), { status: 400 });
  return { definition, payload: { schemaVersion: definition.version, fields } };
}
