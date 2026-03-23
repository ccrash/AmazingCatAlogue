import React, { ReactNode, useEffect, useMemo, createContext, useContext} from 'react'
import { Appearance, type ColorSchemeName } from 'react-native'
import { type Theme } from '@react-navigation/native'
import { useThemeStore, getEffectiveScheme } from '@store/useThemeStore'
import { makeTheme, makeNavTheme, type AppTheme } from './tokens'

export const ThemeContext = createContext<{ theme: AppTheme }>({ theme: makeTheme('light') })
export const useTheme = () => useContext(ThemeContext).theme

export const ThemeProvider = ({ children }: { children: (navTheme: Theme) => ReactNode }) => {
  const setSystemScheme = useThemeStore(s => s.setSystemScheme)

  useEffect(() => {
    const current = Appearance.getColorScheme() ?? 'light'
    setSystemScheme(current)
    const sub = Appearance.addChangeListener((prefs: { colorScheme?: ColorSchemeName }) => {
      setSystemScheme(prefs.colorScheme ?? 'light')
    })
    return () => sub.remove()
  }, [setSystemScheme])

  const scheme = useThemeStore(getEffectiveScheme)
  const theme = useMemo(() => makeTheme(scheme), [scheme])
  const navTheme = useMemo(() => makeNavTheme(theme), [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children(navTheme)}
    </ThemeContext.Provider>
  )
}
