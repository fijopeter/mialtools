import { useEffect, useMemo, useRef, useState } from 'react';
import './ComboInput.css';

/**
 * Editable dropdown (combobox):
 * - User can type any value.
 * - User can click the arrow to pick from preset options.
 * - Re-opening always shows the full option list (not a one-time browser cache like <datalist>).
 */
export default function ComboInput({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  options = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    const unique = new Set();
    (options || []).forEach((option) => unique.add(String(option)));
    return Array.from(unique);
  }, [options]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const selectOption = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="combo-root" data-disabled={disabled ? 'true' : 'false'}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          // Do not auto-open; only open via arrow click so typing stays clean.
        }}
      />

      <button
        type="button"
        className="combo-toggle"
        disabled={disabled}
        aria-label="Show options"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onMouseDown={(e) => {
          // Prevent input blur before click is handled.
          e.preventDefault();
        }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        ▼
      </button>

      {isOpen && normalizedOptions.length > 0 && (
        <div className="combo-popover" role="listbox">
          {normalizedOptions.map((optionValue) => (
            <button
              key={optionValue}
              type="button"
              className="combo-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(optionValue)}
            >
              {optionValue}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
