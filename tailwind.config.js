/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        appBg: 'var(--bg)',
        panel: 'var(--panel)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        textMain: 'var(--text)',
        textSub: 'var(--text-2)',
        muted: 'var(--muted)',
        brand: {
          DEFAULT: 'var(--brand)',
          primary: 'var(--brand-strong)',
          strong: 'var(--brand-strong)',
          hover: 'var(--brand-hover)',
          soft: 'var(--brand-soft)',
          ink: 'var(--brand-ink)',
        },
        status: {
          ok: 'var(--ok)',
          'ok-soft': 'var(--ok-soft)',
          warn: 'var(--warn)',
          'warn-soft': 'var(--warn-soft)',
          danger: 'var(--danger)',
          'danger-soft': 'var(--danger-soft)',
          info: 'var(--info)',
          'info-soft': 'var(--info-soft)',
          online: 'var(--online)',
        },
        ch: {
          whatsapp: 'var(--ch-whatsapp)',
          instagram: 'var(--ch-instagram)',
          telegram: 'var(--ch-telegram)',
          messenger: 'var(--ch-messenger)',
          phone: 'var(--ch-phone)',
          tour: 'var(--ch-tour)',
          email: 'var(--ch-email)',
          discord: 'var(--ch-discord)',
        }
      },
      fontFamily: {
        sans: ['Inter Tight', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Inter Tight', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
      }
    },
  },
  plugins: [],
}
