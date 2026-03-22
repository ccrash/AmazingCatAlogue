import React from 'react'
import { StatusBar } from 'react-native'
import { useStoreSelector } from '@hooks/store'
import { selectEffectiveScheme } from '@store/themeSlice'
import { useTheme } from '@theme/ThemeProvider'

export default function ThemedStatusBar() {
  const scheme = useStoreSelector(selectEffectiveScheme)
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