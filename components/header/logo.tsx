import React from 'react'
import { View, StyleSheet } from 'react-native'
import Logo from '@assets/icon.svg'
import { useTheme } from '@theme/ThemeProvider'

export default function HeaderLogo() {
  const theme = useTheme()

  return (
    <View style={styles.wrap} accessibilityRole='header' accessibilityLabel='App header'>
      <Logo width={30} height={24} fill={theme.colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
})
