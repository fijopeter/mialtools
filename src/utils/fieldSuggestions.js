import { supabase, isSupabaseConfigured } from './supabaseClient'

const TABLE = 'field_suggestions'
export const MAX_SUGGESTIONS_PER_FIELD = 20

/** Returns a map of fieldKey -> array of previously entered values (most recent first). */
export async function fetchFieldSuggestions() {
  if (!isSupabaseConfigured) return {}

  const { data, error } = await supabase
    .from(TABLE)
    .select('field_key, value')
    .order('last_used_at', { ascending: false })

  if (error || !data) return {}

  const map = {}
  data.forEach(({ field_key, value }) => {
    const list = map[field_key] || (map[field_key] = [])
    if (list.length < MAX_SUGGESTIONS_PER_FIELD && !list.includes(value)) {
      list.push(value)
    }
  })
  return map
}

/** Records the form's free-text values so they can be suggested later. Returns the rows that were saved. */
export async function recordFieldSuggestions(fieldMeta, formData) {
  if (!isSupabaseConfigured) return []

  const now = new Date().toISOString()
  const rows = Object.entries(formData)
    .filter(([key, value]) => {
      const meta = fieldMeta[key]
      if (!meta || meta.dropdown || meta.inputType === 'date' || meta.disabled) return false
      return typeof value === 'string' && value.trim() !== ''
    })
    .map(([key, value]) => ({
      field_key: key,
      value: value.trim(),
      last_used_at: now,
    }))

  if (rows.length === 0) return []

  await supabase.from(TABLE).upsert(rows, { onConflict: 'field_key,value' })
  return rows
}
