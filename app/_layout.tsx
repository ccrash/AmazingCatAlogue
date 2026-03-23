import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { ThemeProvider as NavThemeProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ThemeProvider } from '@theme/ThemeProvider';
import ThemedStatusBar from '@components/themedStatusBar';
import { RootErrorBoundary } from '@components/rootErrorBoundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <RootErrorBoundary>
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
    </RootErrorBoundary>
  );
}
