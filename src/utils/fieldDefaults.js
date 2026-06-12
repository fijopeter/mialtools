export function defaultFromPlaceholder(placeholder) {
  if (!placeholder || typeof placeholder !== 'string') return '';

  const trimmed = placeholder.trim();
  const withoutExamplePrefix = trimmed.replace(/^e\.g\.\s*,?\s*/i, '');
  if (withoutExamplePrefix !== trimmed) return withoutExamplePrefix;

  const withoutEnterPrefix = trimmed.replace(/^enter\s+/i, '');
  if (withoutEnterPrefix !== trimmed) return withoutEnterPrefix;

  return trimmed;
}

export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolveFieldDefault(fieldMeta = {}) {
  if (fieldMeta.defaultValue !== undefined && fieldMeta.defaultValue !== null) {
    return fieldMeta.defaultValue;
  }

  if (fieldMeta.inputType === 'date') {
    return todayIsoDate();
  }

  return defaultFromPlaceholder(fieldMeta.placeholder);
}
