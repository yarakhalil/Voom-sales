import React from 'react';
import { useApp } from '../../context/AppContext';

export interface AvatarProps {
  /** Full name or identifier used to compute initials and background tone */
  name: string;
  /** Size variant of the avatar circle */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Online indicator dot: true for green, false for gray, null to omit */
  online?: boolean | null;
  /** Highlight ring around avatar, e.g. 'alert' for urgent items, 'ok' for active */
  ring?: boolean | 'ok' | 'alert' | string;
  /** Optional custom CSS class name */
  className?: string;
  /** Hover tooltip text, defaults to the provided name */
  title?: string;
}

/**
 * Renders a circular user avatar with deterministic color tone,
 * computed initials, and optional presence indicator or highlight ring.
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  online = null,
  ring = false,
  className = '',
  title,
}) => {
  const { initials, avatarTone } = useApp();
  const initialsText = initials(name);
  const colorTone = avatarTone(initialsText);

  // Map size prop to stylesheet CSS classes
  const sizeClass =
    size === 'xs' || size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : '';

  // Construct border ring class
  const ringClass = ring ? `ring ${ring === true ? '' : `ring-${ring}`}` : '';

  return (
    <span
      className={`avatar ${sizeClass} ${ringClass} t${colorTone} ${className}`.trim()}
      data-tone
      title={title || name}
    >
      {initialsText}
      {online !== null && (
        <i className={`presence ${online ? '' : 'off'}`} aria-hidden="true" />
      )}
    </span>
  );
};

export default Avatar;
