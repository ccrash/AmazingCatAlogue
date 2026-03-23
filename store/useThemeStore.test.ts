import { useThemeStore, getEffectiveScheme } from '@store/useThemeStore'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  useThemeStore.setState({ mode: 'system', system: 'light' })
})

describe('initial state', () => {
  it('defaults to system mode and light system scheme', () => {
    const s = useThemeStore.getState()
    expect(s.mode).toBe('system')
    expect(s.system).toBe('light')
  })
})

describe('setMode', () => {
  it('updates mode to dark', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('updates mode to light', () => {
    useThemeStore.setState({ mode: 'dark' })
    useThemeStore.getState().setMode('light')
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('updates mode to system', () => {
    useThemeStore.setState({ mode: 'dark' })
    useThemeStore.getState().setMode('system')
    expect(useThemeStore.getState().mode).toBe('system')
  })
})

describe('setSystemScheme', () => {
  it('updates system to dark', () => {
    useThemeStore.getState().setSystemScheme('dark')
    expect(useThemeStore.getState().system).toBe('dark')
  })

  it('updates system to light', () => {
    useThemeStore.setState({ system: 'dark' })
    useThemeStore.getState().setSystemScheme('light')
    expect(useThemeStore.getState().system).toBe('light')
  })
})

describe('getEffectiveScheme', () => {
  it('returns OS scheme when mode is "system"', () => {
    useThemeStore.setState({ mode: 'system', system: 'dark' })
    expect(getEffectiveScheme(useThemeStore.getState())).toBe('dark')
  })

  it('returns "dark" when mode is explicitly "dark" regardless of OS', () => {
    useThemeStore.setState({ mode: 'dark', system: 'light' })
    expect(getEffectiveScheme(useThemeStore.getState())).toBe('dark')
  })

  it('returns "light" when mode is explicitly "light" regardless of OS', () => {
    useThemeStore.setState({ mode: 'light', system: 'dark' })
    expect(getEffectiveScheme(useThemeStore.getState())).toBe('light')
  })
})
