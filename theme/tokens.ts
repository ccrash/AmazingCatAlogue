import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native'

export type AppTheme = {
  scheme: 'light' | 'dark'
  colors: {
    bg: string
    text: string
    card: string
    primary: string
    border: string
    muted: string,
    white: string
    /** Inverted surface used for photo/search cards so they stand out from the bg */
    surfaceAlt: string
    /** Text and icon color on top of surfaceAlt */
    onSurfaceAlt: string
  }
  radius: number
  spacing: (n: number) => number
}

export const ERROR_COLOR = '#ef4444'

export const makeTheme = (scheme: 'light' | 'dark'): AppTheme => {
  const isDark = scheme === 'dark'
  return {
    scheme,
    colors: {
      bg: isDark ? '#0b0b0b' : '#fafafa',
      text: isDark ? '#ffffff' : '#111111',
      card: isDark ? '#161616' : '#ffffff',
      primary: '#F97316',
      border: isDark ? '#2a2a2a' : '#e5e7eb',
      muted: isDark ? '#9ca3af' : '#6b7280',
      white: '#ffffff',
      surfaceAlt: isDark ? '#eeeeee' : '#1f1f1f',
      onSurfaceAlt: isDark ? '#1f1f1f' : '#eeeeee',
    },
    radius: 12,
    spacing: n => n * 4
  }
}

export const makeNavTheme = (t: AppTheme): Theme => {
  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: t.colors.primary,
      background: t.colors.bg,
      card: t.colors.card,
      text: t.colors.text,
      border: t.colors.border,
      notification: t.colors.primary
    }
  }
}
