/**
 * HTML date inputs store values as YYYY-MM-DD. Certificates/tags read better as DD/MM/YYYY.
 * Any other string is returned unchanged (e.g. legacy free-typed dates).
 */
export function formatStoredDateForDisplay(value) {
  if (value == null || value === '') return '';
  const s = String(value).trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const [, year, month, day] = iso;
    return `${day}/${month}/${year}`;
  }
  return s;
}
