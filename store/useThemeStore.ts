import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Mode = 'light' | 'dark' | 'system'
type Scheme = 'light' | 'dark'

type ThemeState = {
  mode: Mode
  system: Scheme
}

type ThemeActions = {
  setMode: (mode: Mode) => void
  setSystemScheme: (scheme: Scheme) => void
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      mode: 'system',
      system: 'light',
      setMode: (mode) => set({ mode }),
      setSystemScheme: (scheme) => set({ system: scheme }),
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
)

export const getEffectiveScheme = (s: ThemeState): Scheme =>
  s.mode === 'system' ? s.system : s.mode
