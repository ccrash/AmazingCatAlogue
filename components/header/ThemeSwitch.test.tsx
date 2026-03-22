import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'

// Mocks
const mockDispatch = jest.fn()
const mockUseStoreSelector = jest.fn()
jest.mock('@hooks/store', () => ({
  useStoreDispatch: () => mockDispatch,
  useStoreSelector: (fn: any) => mockUseStoreSelector(fn)
}))

const mockSetMode = jest.fn((mode: 'light' | 'dark') => ({
  type: 'theme/setMode',
  payload: mode
}))
jest.mock('@store/themeSlice', () => ({
  setMode: (mode: 'light' | 'dark') => mockSetMode(mode),
  selectEffectiveScheme: (_state: any) => 'light'
}))

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: { text: '#101010' }
  })
}))

import HeaderThemeSwitch from './ThemeSwitch'

const getThumbColor = (node: any) =>
  node.props.thumbColor ??
  node.props.thumbTintColor ??
  node.props?.style?.thumbColor

const getTrackColor = (node: any) =>
  node.props.trackColor ??
  node.props.onTintColor ??         // older iOS-style
  node.props.tintColor ??           // older prop
  node.props?.style?.trackColor

beforeEach(() => {
  jest.clearAllMocks()
})

describe('HeaderThemeSwitch', () => {
  test('renders Switch reflecting dark scheme', () => {
  mockUseStoreSelector.mockReturnValue('dark')

  render(<HeaderThemeSwitch />)
  const sw = screen.getByLabelText('Toggle dark mode')

  expect(sw.props.value).toBe(true)
  expect(getThumbColor(sw)).toBe('#101010')

  const track = getTrackColor(sw)
  if (track !== undefined) {
    expect(track).toEqual("#6b7280")
  }
})

test('renders Switch reflecting light scheme', () => {
  mockUseStoreSelector.mockReturnValue('light')

  render(<HeaderThemeSwitch />)
  const sw = screen.getByLabelText('Toggle dark mode')

  expect(sw.props.value).toBe(false)
  expect(getThumbColor(sw)).toBe('#101010')

  const track = getTrackColor(sw)
  if (track !== undefined) {
    expect(track).toEqual("#6b7280")
  }
})

  test('toggling from dark dispatches setMode("light")', () => {
    mockUseStoreSelector.mockReturnValue('dark')

    render(<HeaderThemeSwitch />)
    const sw = screen.getByLabelText('Toggle dark mode')

    fireEvent(sw, 'valueChange', false)

    expect(mockSetMode).toHaveBeenCalledWith('light')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'theme/setMode', payload: 'light' })
  })

  test('toggling from light dispatches setMode("dark")', () => {
    mockUseStoreSelector.mockReturnValue('light')

    render(<HeaderThemeSwitch />)
    const sw = screen.getByLabelText('Toggle dark mode')

    fireEvent(sw, 'valueChange', true)

    expect(mockSetMode).toHaveBeenCalledWith('dark')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'theme/setMode', payload: 'dark' })
  })

  test('has the accessibility label', () => {
    mockUseStoreSelector.mockReturnValue('light')

    render(<HeaderThemeSwitch />)
    expect(screen.getByLabelText('Toggle dark mode')).toBeTruthy()
  })
})