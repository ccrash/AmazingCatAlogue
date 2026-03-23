import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@theme/ThemeProvider'
import type { AppTheme } from '@theme/tokens'

export default function HeaderTitle() {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={styles.wrap} accessibilityRole='header' accessibilityLabel='App header'>
      <Text style={styles.text}>CatAlogue</Text>
    </View>
  )
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' },
    text: { color: t.colors.text, fontSize: 18, fontWeight: '600', marginLeft: 8}
  })
