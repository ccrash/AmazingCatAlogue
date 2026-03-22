import React, { useMemo, useCallback } from 'react'
import { View, Switch, StyleSheet } from 'react-native'
import { useStoreDispatch, useStoreSelector } from '@hooks/store'
import { selectEffectiveScheme, setMode } from '@store/themeSlice'
import { useTheme } from '@theme/ThemeProvider'

export default function HeaderThemeSwitch() {
  const dispatch = useStoreDispatch()
  const scheme = useStoreSelector(selectEffectiveScheme)
  const isDark = scheme === 'dark'
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(), [])

  const onToggle = useCallback(() => {
    // simple toggle between light/dark (ignores 'system' for the header control)
    dispatch(setMode(isDark ? 'light' : 'dark'))
  }, [dispatch, isDark])

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
