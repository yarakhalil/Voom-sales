import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Theme, DigitMode, LocalizedField } from '../types';
import { translations } from '../data/translations';
import {
  convertDigits,
  formatNumber,
  formatPercent,
  formatMoney,
  formatStandardDate,
  formatHijriDate,
  formatTimeAgo,
} from '../utils/formatters';
import { getAvatarTone, getInitials, resolveLocalized } from '../utils/helpers';

interface AppContextType {
  // Localization & Direction
  lang: Locale;
  setLang: (lang: Locale) => void;
  dir: 'ltr' | 'rtl';
  digits: DigitMode;
  setDigits: (mode: DigitMode) => void;

  // Theming & Layout Modes
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  railX: boolean;
  setRailX: React.Dispatch<React.SetStateAction<boolean>>;
  showApi: boolean;
  setShowApi: React.Dispatch<React.SetStateAction<boolean>>;
  svcOpen: boolean;
  setSvcOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Translation & Localization Functions
  t: (key: string, replacements?: Record<string, string | number>) => string;
  L: (field: LocalizedField | null | undefined) => string;
  nd: (val: string) => string;
  n: (val: number | string, opts?: Intl.NumberFormatOptions) => string;
  pct: (val: number, digits?: number) => string;
  money: (val: number, cur?: string, compact?: boolean) => string;
  formatDate: (d: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  hijriDate: (d: Date | string) => string;
  timeAgo: (minutes: number) => string;

  // Utilities
  avatarTone: (name: string) => number;
  initials: (name: string) => string;

  // Toast Notifications
  toast: (msg: string) => void;
  toastMessage: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Locale>(() => {
    return (localStorage.getItem('voom.lang') as Locale) || 'ar';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('voom.theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [digits, setDigits] = useState<DigitMode>('latn');
  const [railX, setRailX] = useState<boolean>(() => localStorage.getItem('voom.rail') === '1');
  const [showApi, setShowApi] = useState<boolean>(() => localStorage.getItem('voom.api') === '1');
  const [svcOpen, setSvcOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Synchronize document attributes with language and direction
  useEffect(() => {
    localStorage.setItem('voom.lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  // Synchronize theme attribute and CSS classes
  useEffect(() => {
    localStorage.setItem('voom.theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Synchronize collapsed rail state
  useEffect(() => {
    localStorage.setItem('voom.rail', railX ? '1' : '');
    document.documentElement.classList.toggle('rail-x', railX);
  }, [railX]);

  // Synchronize API tag display mode
  useEffect(() => {
    localStorage.setItem('voom.api', showApi ? '1' : '');
    document.body.classList.toggle('show-api', showApi);
  }, [showApi]);

  const setLang = (newLang: Locale) => setLangState(newLang);
  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Notification toast trigger
  const toast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Convert digits helper
  const nd = (s: string) => convertDigits(s, lang, digits);

  // Translation helper
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = (translations[lang] || {}) as Record<string, string>;
    const fallback = (translations.en || {}) as Record<string, string>;
    let text = dict[key] ?? fallback[key] ?? key;

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return nd(text);
  };

  // Localized field resolver
  const L = (field: LocalizedField | null | undefined): string => {
    const resolved = resolveLocalized(field, lang);
    return nd(resolved);
  };

  // Number & formatting wrappers
  const n = (v: number | string, opts?: Intl.NumberFormatOptions) => formatNumber(v, lang, digits, opts);
  const pct = (v: number, dig = 0) => formatPercent(v, lang, digits, dig);
  const money = (v: number, cur = 'SAR', compact = true) => formatMoney(v, lang, digits, cur, compact);
  const formatDate = (d: Date | string, options?: Intl.DateTimeFormatOptions) => formatStandardDate(d, lang, digits, options);
  const hijriDate = (d: Date | string) => formatHijriDate(d, lang, digits);
  const timeAgo = (minutes: number) => formatTimeAgo(minutes, lang, digits);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        dir,
        theme,
        setTheme,
        toggleTheme,
        digits,
        setDigits,
        railX,
        setRailX,
        showApi,
        setShowApi,
        svcOpen,
        setSvcOpen,
        mobileNavOpen,
        setMobileNavOpen,
        t,
        L,
        nd,
        n,
        pct,
        money,
        formatDate,
        hijriDate,
        timeAgo,
        avatarTone: getAvatarTone,
        initials: getInitials,
        toast,
        toastMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
