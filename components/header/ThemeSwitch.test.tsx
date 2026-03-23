import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}))

const mockThemeState: any = {
  mode: 'system',
  system: 'light',
  setMode: jest.fn(),
  setSystemScheme: jest.fn(),
}

const mockUseThemeStore = jest.fn((selector: any) =>
  typeof selector === 'function' ? selector(mockThemeState) : mockThemeState
)

jest.mock('@store/useThemeStore', () => ({
  useThemeStore: (selector: any) => mockUseThemeStore(selector),
  getEffectiveScheme: (s: any) => (s.mode === 'system' ? s.system : s.mode),
}))

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { text: '#101010' } }),
}))

import HeaderThemeSwitch from './themeSwitch'

const getThumbColor = (node: any) =>
  node.props.thumbColor ?? node.props.thumbTintColor ?? node.props?.style?.thumbColor

beforeEach(() => {
  jest.clearAllMocks()
  mockThemeState.mode = 'system'
  mockThemeState.system = 'light'
  mockThemeState.setMode = jest.fn()
  mockUseThemeStore.mockImplementation((selector: any) =>
    typeof selector === 'function' ? selector(mockThemeState) : mockThemeState
  )
})

describe('HeaderThemeSwitch', () => {
  test('renders Switch reflecting dark scheme', () => {
    mockThemeState.system = 'dark'
    render(<HeaderThemeSwitch />)
    const sw = screen.getByLabelText('Toggle dark mode')
    expect(sw.props.value).toBe(true)
    expect(getThumbColor(sw)).toBe('#101010')
  })

  test('renders Switch reflecting light scheme', () => {
    mockThemeState.system = 'light'
    render(<HeaderThemeSwitch />)
    const sw = screen.getByLabelText('Toggle dark mode')
    expect(sw.props.value).toBe(false)
    expect(getThumbColor(sw)).toBe('#101010')
  })

  test('toggling from dark calls setMode("light")', () => {
    mockThemeState.system = 'dark'
    render(<HeaderThemeSwitch />)
    fireEvent(screen.getByLabelText('Toggle dark mode'), 'valueChange', false)
    expect(mockThemeState.setMode).toHaveBeenCalledWith('light')
  })

  test('toggling from light calls setMode("dark")', () => {
    mockThemeState.system = 'light'
    render(<HeaderThemeSwitch />)
    fireEvent(screen.getByLabelText('Toggle dark mode'), 'valueChange', true)
    expect(mockThemeState.setMode).toHaveBeenCalledWith('dark')
  })

  test('has the accessibility label', () => {
    render(<HeaderThemeSwitch />)
    expect(screen.getByLabelText('Toggle dark mode')).toBeTruthy()
  })
})
