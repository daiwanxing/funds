import {
  defineConfig,
  presetWind3,
  presetIcons,
  presetWebFonts,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: [{ name: 'Inter', weights: ['400', '500', '600', '700'] }],
        mono: [{ name: 'JetBrains Mono', weights: ['400', '500'] }],
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],

  theme: {
    colors: {
      // ── Backgrounds ──────────────────────────────
      'bg-0': '#0A0B0D',
      'bg-1': '#111317',
      'bg-2': '#171A1F',
      'bg-3': '#1D2128',
      'bg-4': '#252A33',

      // ── Accent ───────────────────────────────────
      accent: '#2F81F7',
      'accent-hover': '#4B92FF',
      'accent-active': '#1F6FE0',

      // ── Rise (Up / 涨) ───────────────────────────
      rise: '#FF5A52',
      'rise-strong': '#FF453A',
      'rise-deep': '#D93A32',

      // ── Fall (Down / 跌) ─────────────────────────
      fall: '#30D158',
      'fall-strong': '#32C759',
      'fall-deep': '#1FA346',

      // ── Utility ──────────────────────────────────
      warning: '#FF9F0A',
      info: '#64D2FF',
      danger: '#FF443A',
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
  },

  shortcuts: {
    // ── Text semantics ────────────────────────────
    'text-p': 'text-white/92', // primary
    'text-s': 'text-white/68', // secondary
    'text-t': 'text-white/44', // tertiary
    'text-d': 'text-white/24', // disabled
    'text-up': 'text-rise font-mono tabular-nums',
    'text-down': 'text-fall font-mono tabular-nums',
    'num': 'font-mono tabular-nums', // all numeric values

    // ── Backgrounds ───────────────────────────────
    'bg-card': 'bg-bg-2',
    'bg-card-hover': 'bg-bg-3',
    'bg-elevated': 'bg-bg-3',
    'bg-surface': 'bg-bg-1',
    'bg-root': 'bg-bg-0',

    // ── Borders ───────────────────────────────────
    'border-s': 'border border-white/6',  // subtle
    'border-d': 'border border-white/10', // default
    'border-t': 'border border-white/16', // strong

    // ── Divider ───────────────────────────────────
    'divider': 'border-t border-white/6',

    // ── Tags ──────────────────────────────────────
    'tag-up': 'bg-rise-strong text-white text-xs px-1.5 py-0.5 rounded font-mono',
    'tag-down': 'bg-fall-strong text-white text-xs px-1.5 py-0.5 rounded font-mono',

    // ── Buttons ───────────────────────────────────
    btn: 'inline-flex items-center justify-center cursor-pointer px-3 py-1.5 rounded text-sm transition-colors',
    'btn-primary': 'btn bg-accent hover:bg-accent-hover active:bg-accent-active text-white',
    'btn-ghost': 'btn bg-white/6 hover:bg-white/9 text-p border-s',

    // ── Dashboard zones ───────────────────────────
    'zone': 'flex flex-col overflow-hidden',
  },
})
