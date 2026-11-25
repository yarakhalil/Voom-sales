import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
  placeholder?: string;
  'aria-label'?: string;
  name?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  className = '',
  style,
  buttonStyle,
  menuStyle,
  placeholder,
  'aria-label': ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="custom-select-wrap"
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      <button
        type="button"
        id={id}
        className={`select ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || (selectedOption ? selectedOption.label : placeholder)}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          cursor: 'pointer',
          textAlign: 'start',
          backgroundImage: 'none',
          paddingInlineStart: '14px',
          paddingInlineEnd: '12px',
          userSelect: 'none',
          ...buttonStyle,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder || ''}
        </span>
        <ChevronDown
          className="ico-xs"
          style={{
            width: '15px',
            height: '15px',
            flexShrink: 0,
            color: 'var(--muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--dur-1) var(--ease)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            insetInlineStart: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '320px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-3)',
            zIndex: 150,
            padding: '4px',
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            ...menuStyle,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  background: isSelected ? 'var(--brand-soft)' : 'transparent',
                  color: isSelected ? 'var(--brand-ink)' : 'var(--text)',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  border: 0,
                  textAlign: 'start',
                  transition: 'background 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--muted)',
                      marginInlineStart: '8px',
                    }}
                  >
                    {opt.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
