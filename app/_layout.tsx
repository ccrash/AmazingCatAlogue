import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@store/index'
import { ThemeProvider as NavThemeProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ThemeProvider } from '@theme/ThemeProvider';
import ThemedStatusBar from '@components/ThemedStatusBar';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
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
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
