import React from 'react'
import { StatusBar } from 'react-native'
import { useThemeStore, getEffectiveScheme } from '@store/useThemeStore'
import { useTheme } from '@theme/ThemeProvider'

export default function ThemedStatusBar() {
  const scheme = useThemeStore(getEffectiveScheme)
  const theme = useTheme()

  return (
    <StatusBar
      barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.card}
      translucent={false}
      animated
    />
  )
}