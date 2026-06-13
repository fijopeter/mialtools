import { getCertificateFieldKeys } from './certificateColumns.js';
import { CALIBRATED_BY_OPTIONS } from './signatures.js';

export const TAG_SECTION_TITLE = 'Additional Information needed for Tag';

/** Maps tag-only field keys to a meter/certificate field when they represent the same data. */
const TAG_FIELD_ALIASES = {
  modbusAddress: 'address',
  modulusAddress: 'address',
  communicationInterfaceTag: 'communicationInterface',
  analogOutputs: 'analogOutput',
  calibrationDate: 'date',
};

export function defaultFromPlaceholder(placeholder) {
  if (!placeholder || typeof placeholder !== 'string') return '';
  return placeholder.trim().replace(/^e\.g\.[,:\s]+/i, '').trim();
}

export function resolveFieldDefault(meta) {
  if (!meta) return '';
  if (meta.defaultValue !== undefined && meta.defaultValue !== null && String(meta.defaultValue).trim() !== '') {
    return meta.defaultValue;
  }
  return '';
}

function buildExcludedTagFieldKeys(meterSchema, certificateConfig, tagDrawConfig) {
  const excluded = new Set(meterSchema.sections.flatMap((section) => section.fields));

  getCertificateFieldKeys(certificateConfig).forEach((fieldKey) => excluded.add(fieldKey));

  tagDrawConfig?.fields?.forEach((field) => {
    if (field.fallbackKey && excluded.has(field.fallbackKey)) {
      excluded.add(field.key);
    }
  });

  Object.entries(TAG_FIELD_ALIASES).forEach(([aliasKey, canonicalKey]) => {
    if (excluded.has(canonicalKey)) {
      excluded.add(aliasKey);
    }
  });

  return excluded;
}

export function mergeMeterAndTagSchemas(meterSchema, tagSchema, certificateConfig, tagDrawConfig) {
  const excludedTagFields = buildExcludedTagFieldKeys(meterSchema, certificateConfig, tagDrawConfig);

  const normalizedMeterFieldMeta = Object.fromEntries(
    Object.entries(meterSchema.fieldMeta || {}).map(([key, meta]) => [
      key,
      {
        ...meta,
        defaultValue: resolveFieldDefault(meta),
      },
    ]),
  );

  const normalizedTagFieldMeta = Object.fromEntries(
    Object.entries(tagSchema?.fieldMeta || {}).map(([key, meta]) => [
      key,
      {
        ...meta,
        defaultValue: resolveFieldDefault(meta),
      },
    ]),
  );

  const fieldMeta = {
    ...normalizedMeterFieldMeta,
    ...normalizedTagFieldMeta,
  };

  if (fieldMeta.calibratedBy) {
    fieldMeta.calibratedBy = {
      ...fieldMeta.calibratedBy,
      dropdown: true,
      options: CALIBRATED_BY_OPTIONS,
    };
  }

  const tagSections = (tagSchema?.sections || [])
    .map((section) => ({
      ...section,
      title: TAG_SECTION_TITLE,
      fields: section.fields.filter((fieldKey) => !excludedTagFields.has(fieldKey)),
    }))
    .filter((section) => section.fields.length > 0);

  const sections = [...meterSchema.sections, ...tagSections];

  return { fieldMeta, sections };
}

export function buildInitialFormData(fieldMeta) {
  return Object.keys(fieldMeta).reduce((allFields, key) => {
    allFields[key] = resolveFieldDefault(fieldMeta[key]);
    return allFields;
  }, {});
}

export function getFieldValue(data, fieldKey, fallbackKey) {
  const primary = (data[fieldKey] || '').trim();
  if (primary) return data[fieldKey];
  if (fallbackKey) return data[fallbackKey] || '';
  return data[fieldKey] || '';
}
