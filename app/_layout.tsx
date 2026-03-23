import { Component, type ReactNode } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { ThemeProvider as NavThemeProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ThemeProvider } from '@theme/ThemeProvider';
import ThemedStatusBar from '@components/themedStatusBar';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>{(this.state.error as Error).message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', textAlign: 'center' },
})

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          {(navTheme) => (
            <NavThemeProvider value={navTheme as Theme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <ThemedStatusBar />
            </NavThemeProvider>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
