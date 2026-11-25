import { Locale, DigitMode } from '../types';

/**
 * Converts numbers within strings between Latin (0-9) and Eastern Arabic (٠-٩) digits.
 */
export const convertDigits = (
  value: string,
  lang: Locale,
  digitsMode: DigitMode
): string => {
  if (typeof value !== 'string') return String(value || '');
  if (lang === 'ar') {
    return digitsMode === 'latn'
      ? value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
      : value.replace(/[0-9]/g, (d) => String.fromCharCode(0x660 + +d));
  }
  return value;
};

/**
 * Returns BCP-47 locale tag for Intl APIs based on language and digit preferences.
 */
export const getIntlLocale = (lang: Locale, digitsMode: DigitMode): string => {
  if (lang === 'ar') {
    return digitsMode === 'arab' ? 'ar-SA' : 'ar-SA-u-nu-latn';
  }
  return 'en-US';
};

/**
 * Formats a number with localization and digit mode awareness.
 */
export const formatNumber = (
  value: number | string,
  lang: Locale,
  digitsMode: DigitMode,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  const formatted = new Intl.NumberFormat(getIntlLocale(lang, digitsMode), options).format(num);
  return convertDigits(formatted, lang, digitsMode);
};

/**
 * Formats a fraction/decimal as a percentage string (e.g. 0.25 -> 25%).
 */
export const formatPercent = (
  value: number,
  lang: Locale,
  digitsMode: DigitMode,
  fractionDigits = 0
): string => {
  if (value === null || value === undefined) return '—';
  const formatted = new Intl.NumberFormat(getIntlLocale(lang, digitsMode), {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
  return convertDigits(formatted, lang, digitsMode);
};

/**
 * Formats monetary amounts with currency symbol and compact notation.
 */
export const formatMoney = (
  value: number,
  lang: Locale,
  digitsMode: DigitMode,
  currency = 'SAR',
  compact = true
): string => {
  const formatted = new Intl.NumberFormat(getIntlLocale(lang, digitsMode), {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
  return convertDigits(formatted, lang, digitsMode);
};

/**
 * Formats standard Gregorian dates (e.g. "Monday, 24 November 2026" or short dates).
 */
export const formatStandardDate = (
  date: Date | string,
  lang: Locale,
  digitsMode: DigitMode,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOpts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formatted = new Intl.DateTimeFormat(
    getIntlLocale(lang, digitsMode),
    options || defaultOpts
  ).format(dateObj);
  return convertDigits(formatted, lang, digitsMode);
};

/**
 * Formats Hijri (Umm al-Qura) dates for Arabic and Islamic calendar support.
 */
export const formatHijriDate = (
  date: Date | string,
  lang: Locale,
  digitsMode: DigitMode
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeTag =
    lang === 'ar'
      ? digitsMode === 'arab'
        ? 'ar-SA-u-ca-islamic-umalqura'
        : 'ar-SA-u-ca-islamic-umalqura-nu-latn'
      : 'en-US-u-ca-islamic-umalqura';

  const formatted = new Intl.DateTimeFormat(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
  return convertDigits(formatted, lang, digitsMode);
};

/**
 * Formats relative time elapsed in minutes (e.g. "منذ 5 د" or "5m ago").
 */
export const formatTimeAgo = (
  minutes: number,
  lang: Locale,
  digitsMode: DigitMode
): string => {
  if (minutes < 1) return lang === 'ar' ? 'الآن' : 'just now';

  if (minutes < 60) {
    const minsStr = convertDigits(String(minutes), lang, digitsMode);
    return lang === 'ar' ? `منذ ${minsStr} د` : `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    const hrsStr = convertDigits(String(hours), lang, digitsMode);
    return lang === 'ar' ? `منذ ${hrsStr} س` : `${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  const daysStr = convertDigits(String(days), lang, digitsMode);
  return lang === 'ar' ? `منذ ${daysStr} ي` : `${days}d ago`;
};
