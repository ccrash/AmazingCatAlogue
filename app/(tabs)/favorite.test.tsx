import React from 'react'
import { render, screen } from '@testing-library/react-native'

const mockPhotosState: any = { liked: [] }
const mockUsePhotosStore = jest.fn((selector: any) =>
  typeof selector === 'function' ? selector(mockPhotosState) : mockPhotosState
)

jest.mock('@store/usePhotosStore', () => ({
  usePhotosStore: (selector: any) => mockUsePhotosStore(selector),
  selectLikedPhotos: (s: any) => s.liked ?? [],
}))

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: { muted: '#999' },
    spacing: (n: number) => n * 4,
  }),
}))

jest.mock('@components/photoItem', () => {
  const { Text } = require('react-native')
  return {
    PhotoItem: ({ photo }: any) => <Text testID={`photo-${photo.id}`}>{photo.id}</Text>,
    __esModule: true,
    default: ({ photo }: any) => <Text testID={`photo-${photo.id}`}>{photo.id}</Text>,
  }
})

import FavoriteScreen from './favorite'
import { makePhoto } from '../../__mocks__/utils'

beforeEach(() => {
  jest.clearAllMocks()
  mockPhotosState.liked = []
  mockUsePhotosStore.mockImplementation((selector: any) =>
    typeof selector === 'function' ? selector(mockPhotosState) : mockPhotosState
  )
})

describe('FavoriteScreen', () => {
  it('shows empty state when there are no liked photos', () => {
    mockPhotosState.liked = []
    render(<FavoriteScreen />)
    expect(screen.getByText('No favorites yet')).toBeTruthy()
  })

  it('renders a card for each liked photo', () => {
    mockPhotosState.liked = [makePhoto('p1'), makePhoto('p2')]
    render(<FavoriteScreen />)
    expect(screen.getByTestId('photo-p1')).toBeTruthy()
    expect(screen.getByTestId('photo-p2')).toBeTruthy()
  })

  it('does not show empty state when photos are present', () => {
    mockPhotosState.liked = [makePhoto('p1')]
    render(<FavoriteScreen />)
    expect(screen.queryByText('No favorites yet')).toBeNull()
  })
})
