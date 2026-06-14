import { useState } from 'react'
import './SuggestionInput.css'

const MAX_VISIBLE_SUGGESTIONS = 6

/**
 * Plain text input that shows suggestions from previously entered values
 * once the user types a double space after some text (e.g. "24 vd  " ->
 * suggests "24 VDC"). Clicking a suggestion replaces the current value.
 */
export default function SuggestionInput({
  name,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  suggestions = [],
}) {
  const [matches, setMatches] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (e) => {
    const nextValue = e.target.value
    const prefix = nextValue.trim()

    if (nextValue.endsWith('  ') && prefix) {
      const lowerPrefix = prefix.toLowerCase()
      const found = suggestions
        .filter((s) => s.toLowerCase().startsWith(lowerPrefix) && s.toLowerCase() !== lowerPrefix)
        .slice(0, MAX_VISIBLE_SUGGESTIONS)

      if (found.length > 0) {
        onChange(nextValue.slice(0, -1))
        setMatches(found)
        setIsOpen(true)
        return
      }
    }

    onChange(nextValue)
    setIsOpen(false)
  }

  const selectSuggestion = (suggestion) => {
    onChange(suggestion)
    setIsOpen(false)
  }

  return (
    <div className="suggestion-root">
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={() => setIsOpen(false)}
        placeholder={placeholder}
        disabled={disabled}
        className="form-input"
        autoComplete="off"
      />
      {isOpen && matches.length > 0 && (
        <div className="suggestion-popover" role="listbox">
          {matches.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="suggestion-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
