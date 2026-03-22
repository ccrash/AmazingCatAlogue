import React, { ReactNode, useEffect, useMemo, createContext, useContext} from 'react'
import { Appearance, type ColorSchemeName } from 'react-native'
import { useStoreSelector, useStoreDispatch } from '@hooks/store'
import { selectEffectiveScheme, setSystemScheme } from '@store/themeSlice'
import { makeTheme, makeNavTheme, type AppTheme } from './tokens'
import type { RootState } from '@store/index'

export const ThemeContext = createContext<{ theme: AppTheme }>({ theme: makeTheme('light') })
export const useTheme = () => useContext(ThemeContext).theme

export const ThemeProvider = ({ children }: { children: (navTheme: unknown) => ReactNode }) => {
  const dispatch = useStoreDispatch()
  // keep Redux's system scheme in sync with OS
  useEffect(() => {
    const current = Appearance.getColorScheme() ?? 'light'
    dispatch(setSystemScheme(current))
    const sub = Appearance.addChangeListener((prefs: { colorScheme?: ColorSchemeName }) => {
      const next = prefs.colorScheme ?? 'light'
      dispatch(setSystemScheme(next))
    })
    return () => sub.remove()
  }, [dispatch])

  const scheme = useStoreSelector((state: RootState) => selectEffectiveScheme(state))
  const theme = useMemo(() => makeTheme(scheme), [scheme])
  const navTheme = useMemo(() => makeNavTheme(theme), [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children(navTheme)}
    </ThemeContext.Provider>
  )
}
