import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'

type Mode = 'light' | 'dark' | 'system'
type Scheme = 'light' | 'dark'

type ThemeState = {
  mode: Mode           // user preference
  system: Scheme       // current OS scheme
}

const initialState: ThemeState = {
  mode: 'system',
  system: 'light'
}

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<Mode>) => {
      state.mode = action.payload
    },
    setSystemScheme: (state, action: PayloadAction<Scheme>) => {
      state.system = action.payload
    }
  }
})

export const { setMode, setSystemScheme } = slice.actions
export default slice.reducer

const selectTheme = (s: RootState) => ((s as unknown) as { theme: ThemeState }).theme
export const selectMode = (s: RootState) => selectTheme(s).mode
export const selectSystemScheme = (s: RootState) => selectTheme(s).system
export const selectEffectiveScheme = createSelector(
  [selectMode, selectSystemScheme],
  (mode, system) => (mode === 'system' ? system : mode)
)
