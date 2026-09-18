// Ported from the web app's inline dark theme (frontend/src/components/*.jsx) so the
// native app reads as the same product, not a re-skin.
export const colors = {
  background: '#080c16',
  panel: '#0b1120',
  panelAlt: '#0f172a',
  sidebar: 'rgba(8, 12, 22, 0.95)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderAccent: 'rgba(56, 189, 248, 0.15)',
  accent: '#38bdf8',
  accentDark: '#0284c7',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
  danger: '#ef4444',
  warning: '#eab308',
  warningAlt: '#f97316',
  success: '#10b981',
  successAlt: '#a3e635'
} as const;

export const riskClassColor: Record<string, string> = {
  low: colors.success,
  moderate: colors.warning,
  high: colors.danger
};
