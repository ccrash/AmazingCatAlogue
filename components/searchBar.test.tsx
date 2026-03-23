import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    scheme: 'light',
    colors: { text: '#111', card: '#fff', border: '#eee', muted: '#999' },
    spacing: (n: number) => n * 4,
  }),
}))

import SearchBar from '@components/searchBar'

beforeEach(() => jest.clearAllMocks())

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar value="" onChangeText={jest.fn()} />)
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy()
  })

  it('renders with a custom placeholder', () => {
    render(<SearchBar value="" onChangeText={jest.fn()} placeholder="Find a breed" />)
    expect(screen.getByPlaceholderText('Find a breed')).toBeTruthy()
  })

  it('shows search icon and no clear button when value is empty', () => {
    render(<SearchBar value="" onChangeText={jest.fn()} />)
    expect(screen.queryByLabelText('Clear search')).toBeNull()
    expect(screen.getByText('search-outline')).toBeTruthy()
  })

  it('shows clear button and no search icon when value is non-empty', () => {
    render(<SearchBar value="Siamese" onChangeText={jest.fn()} />)
    expect(screen.getByLabelText('Clear search')).toBeTruthy()
    expect(screen.queryByText('search-outline')).toBeNull()
  })

  it('calls onChangeText with empty string when clear is pressed', () => {
    const onChangeText = jest.fn()
    render(<SearchBar value="Bengal" onChangeText={onChangeText} />)
    fireEvent.press(screen.getByLabelText('Clear search'))
    expect(onChangeText).toHaveBeenCalledWith('')
    expect(onChangeText).toHaveBeenCalledTimes(1)
  })

  it('reflects the current value in the TextInput', () => {
    render(<SearchBar value="Ragdoll" onChangeText={jest.fn()} />)
    expect(screen.getByDisplayValue('Ragdoll')).toBeTruthy()
  })

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn()
    render(<SearchBar value="" onChangeText={onChangeText} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search...'), 'Maine')
    expect(onChangeText).toHaveBeenCalledWith('Maine')
  })
})
