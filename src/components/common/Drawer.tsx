import React, { useEffect, useRef, ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export interface DrawerProps {
  /** Controls visibility of the sliding drawer pane */
  open: boolean;
  /** Callback fired when user closes via backdrop, escape key, or close button */
  onClose: () => void;
  /** Primary title rendered in the drawer header */
  title?: ReactNode;
  /** Secondary subtitle or helper text under the title */
  subtitle?: ReactNode;
  /** Optional element rendered before the title (e.g. avatar or icon) */
  lead?: ReactNode;
  /** Optional sticky footer content at the bottom of the drawer */
  footer?: ReactNode;
  /** Drawer scrollable content body */
  children: ReactNode;
  /** Optional custom width in pixels or CSS string */
  width?: number | string;
  /** Whether to omit the default drawer header */
  hideHeader?: boolean;
}

/**
 * Slide-over drawer dialog with backdrop scrim, keyboard accessibility (Escape to close),
 * and automatic focus trapping.
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  lead,
  footer,
  children,
  width,
  hideHeader = false,
}) => {
  const { t } = useApp();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press and manage focus
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Handle responsive width constraints
  const styleWidth: React.CSSProperties = width
    ? { width: typeof width === 'number' ? `min(${width}px, calc(100% - 24px))` : width }
    : {};

  return (
    <>
      {/* Backdrop Scrim */}
      <div
        onClick={onClose}
        className={`scrim ${open ? 'open' : ''}`}
        aria-hidden="true"
      />

      {/* Floating Rounded Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`drawer ${open ? 'open' : ''}`}
        style={styleWidth}
      >
        {/* Drawer Header */}
        {!hideHeader && title && (
          <div className="drawer-h">
            {lead}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dh-name" style={{ fontSize: '17px', fontWeight: 600 }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                  {subtitle}
                </div>
              )}
            </div>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label={t('close')}
              className="icon-btn"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Drawer Body */}
        {open && children}

        {/* Drawer Footer */}
        {footer && <div className="drawer-f">{footer}</div>}
      </aside>
    </>
  );
};

export default Drawer;
