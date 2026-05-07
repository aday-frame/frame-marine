/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface ladder (maps to DESIGN.md surface-1 through surface-4 concept)
        canvas:    '#080808',
        surface:   { 1: '#0f0f0e', 2: '#171716', 3: '#1e1e1d', 4: '#252524', 5: '#2c2c2b' },
        // Text hierarchy
        ink:       { DEFAULT: '#F0F0EC', muted: '#9A9A92', subtle: '#52524A', faint: '#38382F' },
        // Borders
        hairline:  { DEFAULT: 'rgba(255,255,255,0.055)', strong: 'rgba(255,255,255,0.10)', bold: 'rgba(255,255,255,0.16)' },
        // Frame Marine primary accent (blue)
        accent:    { DEFAULT: '#0077b6', hover: '#0096c7', bg: 'rgba(0,119,182,0.12)', border: 'rgba(0,119,182,0.30)' },
        // Status colors
        success:   { DEFAULT: '#4ADE80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.25)' },
        danger:    { DEFAULT: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)' },
        warning:   { DEFAULT: '#FACC15', bg: 'rgba(250,204,21,0.10)', border: 'rgba(250,204,21,0.25)' },
        info:      { DEFAULT: '#60A5FA', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.25)' },
        violet:    { DEFAULT: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)' },
        engine:    { DEFAULT: '#22D3EE', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.25)' },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        // DESIGN.md type scale
        '10': ['10px', { lineHeight: '1.4' }],
        '11': ['11px', { lineHeight: '1.4' }],
        '12': ['12px', { lineHeight: '1.4' }],
        '13': ['13px', { lineHeight: '1.5' }],
        '14': ['14px', { lineHeight: '1.5' }],
        '15': ['15px', { lineHeight: '1.5' }],
        '18': ['18px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '22': ['22px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '28': ['28px', { lineHeight: '1.2',  letterSpacing: '-0.025em' }],
        '40': ['40px', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        '56': ['56px', { lineHeight: '1.1',  letterSpacing: '-0.04em' }],
        '80': ['80px', { lineHeight: '1.05', letterSpacing: '-0.05em' }],
      },
      borderRadius: {
        // Maps to --r2 through --r12
        'xs':  '2px',
        'sm':  '4px',
        'md':  '6px',
        'lg':  '8px',
        'xl':  '10px',
        '2xl': '12px',
        'pill':'9999px',
      },
      spacing: {
        // DESIGN.md spacing scale (4px base)
        'xxs': '4px',
        'xs':  '8px',
        'sm':  '12px',
        'md':  '16px',
        'lg':  '24px',
        'xl':  '32px',
        'xxl': '48px',
        'section': '96px',
      },
      borderWidth: {
        'hair': '0.5px',
      },
      transitionDuration: {
        '120': '120ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
