import React, { useMemo, useCallback } from 'react'
import { View, Switch, StyleSheet } from 'react-native'
import { useThemeStore, getEffectiveScheme } from '@store/useThemeStore'
import { useTheme } from '@theme/ThemeProvider'

export default function HeaderThemeSwitch() {
  const scheme = useThemeStore(getEffectiveScheme)
  const setMode = useThemeStore(s => s.setMode)
  const isDark = scheme === 'dark'
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(), [])

  const onToggle = useCallback(() => {
    // simple toggle between light/dark (ignores 'system' for the header control)
    setMode(isDark ? 'light' : 'dark')
  }, [setMode, isDark])

  return (
    <View style={styles.right}>
      <Switch
        value={isDark}
        onValueChange={onToggle}
        thumbColor={theme.colors.text}
        trackColor={{ false: '#c7c7c7', true: '#6b7280' }}
        accessibilityLabel='Toggle dark mode'
      />
    </View>
  )
}

const makeStyles = () =>
  StyleSheet.create({
    right: { paddingRight: 12 }
  })
