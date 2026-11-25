import { LocalizedField, Locale } from '../types';

/**
 * Calculates a deterministic avatar tone (1-6) based on a string (e.g. name or initials).
 */
export const getAvatarTone = (name: string): number => {
  let hash = 7;
  for (const ch of String(name || '?')) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return (hash % 6) + 1;
};

/**
 * Extracts 1-2 letter initials from a person or entity name.
 * Handles prefixes like "Al-" or "ال" gracefully.
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.replace(/^(Al-|ال)/, '')[0])
    .join('')
    .toUpperCase();
};

/**
 * Resolves a LocalizedField (string or { en, ar }) based on current active language.
 */
export const resolveLocalized = (
  field: LocalizedField | null | undefined,
  lang: Locale
): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || Object.values(field)[0] || '';
};
