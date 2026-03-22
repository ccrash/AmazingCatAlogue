import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

const mockDispatch = jest.fn()
const mockUseStoreSelector = jest.fn()
const mockToggleLike = jest.fn((id: string) => ({ type: 'photos/toggleLike', payload: id }))
const mockCalcImageHeight = jest.fn((_w: number, _h: number) => 240)

jest.mock('@hooks/store', () => ({
  useStoreDispatch: () => mockDispatch,
  useStoreSelector: (fn: any) => mockUseStoreSelector(fn),
}))

jest.mock('@store/photosSlice', () => ({
  toggleLike: (id: string) => mockToggleLike(id),
  toggleLikeAndCache: (id: string) => mockToggleLike(id),
  selectIsLiked: (_id: string) => (_state: any) => false,
}))

jest.mock('@store/votesSlice', () => ({
  selectVoteInfo: (_id: string) => (_state: any) => ({ score: 0, userVote: null }),
  castVoteThunk: jest.fn(() => ({ type: 'votes/cast' })),
}))

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    scheme: 'light',
    colors: { primary: 'tomato', card: 'white', text: 'black', muted: 'gray' },
    spacing: (n: number) => 4 * n,
  }),
}))

jest.mock('@utils/image', () => ({
  screenWidth: 360,
  calcImageHeight: (w: number, h: number) => mockCalcImageHeight(w, h),
}))

import PhotoItem from './PhotoItem'

const makePhoto = (overrides: Partial<any> = {}) => ({
  id: 'p1',
  width: 1000,
  height: 500,
  url: 'https://example.com/photo.jpg',
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  // Default: not liked, no votes
  mockUseStoreSelector.mockReturnValue(false)
})

describe('PhotoItem', () => {
  it('shows loader before image loads and hides it after onLoadEnd', () => {
    const photo = makePhoto()
    const { getByLabelText, queryByLabelText } = render(<PhotoItem photo={photo} />)

    expect(getByLabelText('Loading image')).toBeTruthy()

    fireEvent(getByLabelText('Cat photo'), 'loadEnd')
    expect(queryByLabelText('Loading image')).toBeNull()
  })

  it('computes image height via calcImageHeight', () => {
    const photo = makePhoto({ width: 1200, height: 800 })
    render(<PhotoItem photo={photo} />)
    expect(mockCalcImageHeight).toHaveBeenCalledWith(1200, 800)
  })

  it('renders the image with the correct URI', () => {
    const photo = makePhoto()
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Cat photo').props.source.uri).toBe(photo.url)
  })

  it('unliked state: heart fill is white and accessible as "Like"', () => {
    mockUseStoreSelector.mockReturnValue(false)
    const photo = makePhoto()

    const { getByLabelText, getByTestId } = render(<PhotoItem photo={photo} />)

    expect(getByLabelText('Like cat photo').props.accessibilityState?.selected).toBe(false)
    expect(getByTestId('heart').props.fill).toBe('#ffffff')
  })

  it('liked state: heart fill is primary colour and accessible as "Unlike"', () => {
    mockUseStoreSelector.mockReturnValue(true)
    const photo = makePhoto()

    const { getByLabelText, getByTestId } = render(<PhotoItem photo={photo} />)

    expect(getByLabelText('Unlike cat photo').props.accessibilityState?.selected).toBe(true)
    expect(getByTestId('heart').props.fill).toBe('tomato')
  })

  it('dispatches toggleLikeAndCache when pressing the like button', () => {
    mockUseStoreSelector.mockReturnValue(false)
    const photo = makePhoto()

    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    fireEvent.press(getByLabelText('Like cat photo'))

    expect(mockToggleLike).toHaveBeenCalledWith(photo.id)
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })

  it('renders vote up and vote down buttons', () => {
    const photo = makePhoto()
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Vote up')).toBeTruthy()
    expect(getByLabelText('Vote down')).toBeTruthy()
  })
})
