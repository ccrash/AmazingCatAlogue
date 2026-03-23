import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    scheme: 'light',
    colors: { bg: '#fff', primary: 'tomato', muted: '#999', card: '#fff', border: '#eee' },
    spacing: (n: number) => n * 4,
  }),
}))

const mockFetchAllBreeds = jest.fn()
const mockSearchBreeds = jest.fn()

jest.mock('@utils/api', () => ({
  fetchAllBreeds: (...args: unknown[]) => mockFetchAllBreeds(...args),
  searchBreeds: (...args: unknown[]) => mockSearchBreeds(...args),
}))

jest.mock('@components/searchItem', () => {
  const { Text } = require('react-native')
  return ({ breed }: any) => <Text testID={`breed-${breed.id}`}>{breed.name}</Text>
})

jest.mock('@components/searchBar', () => {
  const { TextInput } = require('react-native')
  return ({ value, onChangeText, placeholder }: any) => (
    <TextInput
      testID="search-bar"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  )
})

const makeBreed = (id: string, name = `Breed ${id}`) => ({ id, name, temperament: '', description: '' })

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  mockFetchAllBreeds.mockResolvedValue([makeBreed('b1'), makeBreed('b2'), makeBreed('b3')])
  mockSearchBreeds.mockResolvedValue([])
})

afterEach(() => {
  jest.useRealTimers()
})

import SearchScreen from './search'

describe('SearchScreen — initial load', () => {
  it('calls fetchAllBreeds on mount', async () => {
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalledTimes(1))
  })

  it('renders breed cards after loading', async () => {
    render(<SearchScreen />)
    await waitFor(() => expect(screen.getByTestId('breed-b1')).toBeTruthy())
  })

  it('shows error text when fetchAllBreeds rejects', async () => {
    mockFetchAllBreeds.mockRejectedValueOnce(new Error('Network error'))
    render(<SearchScreen />)
    await waitFor(() => expect(screen.getByText('Failed to load breeds.')).toBeTruthy())
  })
})

describe('SearchScreen — search debounce', () => {
  it('does not call searchBreeds before the debounce delay', async () => {
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'persian')
    expect(mockSearchBreeds).not.toHaveBeenCalled()
  })

  it('calls searchBreeds after the debounce delay', async () => {
    mockSearchBreeds.mockResolvedValue([makeBreed('b1', 'Persian')])
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'persian')
    act(() => { jest.advanceTimersByTime(400) })

    await waitFor(() => expect(mockSearchBreeds).toHaveBeenCalledWith('persian'))
  })

  it('cancels a pending search when query changes quickly', async () => {
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'per')
    act(() => { jest.advanceTimersByTime(200) })
    fireEvent.changeText(screen.getByTestId('search-bar'), 'persi')
    act(() => { jest.advanceTimersByTime(400) })

    await waitFor(() => expect(mockSearchBreeds).toHaveBeenCalledTimes(1))
    expect(mockSearchBreeds).toHaveBeenCalledWith('persi')
  })

  it('shows search results returned by searchBreeds', async () => {
    mockSearchBreeds.mockResolvedValue([makeBreed('s1', 'Persian')])
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'persian')
    act(() => { jest.advanceTimersByTime(400) })

    await waitFor(() => expect(screen.getByTestId('breed-s1')).toBeTruthy())
  })

  it('shows error text when searchBreeds rejects', async () => {
    mockSearchBreeds.mockRejectedValueOnce(new Error('Search error'))
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'persian')
    act(() => { jest.advanceTimersByTime(400) })

    await waitFor(() => expect(screen.getByText('Search failed. Please try again.')).toBeTruthy())
  })
})

describe('SearchScreen — race condition prevention', () => {
  it('discards results from a stale search when a newer one completes first', async () => {
    let resolveFirst!: (v: unknown) => void
    let resolveSecond!: (v: unknown) => void

    mockSearchBreeds
      .mockImplementationOnce(() => new Promise(r => { resolveFirst = r }))
      .mockImplementationOnce(() => new Promise(r => { resolveSecond = r }))

    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    // First search
    fireEvent.changeText(screen.getByTestId('search-bar'), 'ab')
    act(() => { jest.advanceTimersByTime(400) })

    // Second search before first resolves
    fireEvent.changeText(screen.getByTestId('search-bar'), 'abc')
    act(() => { jest.advanceTimersByTime(400) })

    // Second search resolves first with a result
    await act(async () => { resolveSecond([makeBreed('new', 'NewBreed')]) })

    expect(screen.getByTestId('breed-new')).toBeTruthy()

    // First (stale) search resolves with different data — should be ignored
    await act(async () => { resolveFirst([makeBreed('old', 'OldBreed')]) })

    expect(screen.queryByTestId('breed-old')).toBeNull()
    expect(screen.getByTestId('breed-new')).toBeTruthy()
  })
})

describe('SearchScreen — empty query', () => {
  it('clears search results and shows breed list when query is cleared', async () => {
    mockSearchBreeds.mockResolvedValue([makeBreed('s1', 'Persian')])
    render(<SearchScreen />)
    await waitFor(() => expect(mockFetchAllBreeds).toHaveBeenCalled())

    fireEvent.changeText(screen.getByTestId('search-bar'), 'persian')
    act(() => { jest.advanceTimersByTime(400) })
    await waitFor(() => expect(screen.getByTestId('breed-s1')).toBeTruthy())

    fireEvent.changeText(screen.getByTestId('search-bar'), '')
    await waitFor(() => expect(screen.queryByTestId('breed-s1')).toBeNull())
    expect(screen.getByTestId('breed-b1')).toBeTruthy()
  })
})
