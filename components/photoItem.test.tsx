import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

// --- mutable state shared across mock implementations ---
const mockPhotosState: any = {
  likedIds: {},
  toggleLike: jest.fn(),
}
const mockVotesState: any = {
  byImageId: {},
  castVote: jest.fn(),
}

const mockUsePhotosStore = jest.fn((selector: any) =>
  typeof selector === 'function' ? selector(mockPhotosState) : mockPhotosState
)
const mockUseVotesStore = jest.fn((selector: any) =>
  typeof selector === 'function' ? selector(mockVotesState) : mockVotesState
)

jest.mock('@store/usePhotosStore', () => ({
  usePhotosStore: (selector: any) => mockUsePhotosStore(selector),
  selectIsLiked: (id: string) => (s: any) => Boolean(s?.likedIds?.[id]),
}))

jest.mock('@store/useVotesStore', () => ({
  useVotesStore: (selector: any) => mockUseVotesStore(selector),
  DEFAULT_VOTE_INFO: { score: 0, userVote: null, voteIds: [] },
}))

const mockScheme = { value: 'light' }

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    scheme: mockScheme.value,
    colors: { primary: 'tomato', card: 'white', text: 'black', muted: 'gray' },
    spacing: (n: number) => 4 * n,
  }),
}))

const mockCalcImageHeight = jest.fn((_w: number, _h: number) => 240)
jest.mock('@utils/image', () => ({
  screenWidth: 360,
  calcImageHeight: (w: number, h: number) => mockCalcImageHeight(w, h),
}))

import PhotoItem from './photoItem'
import { makePhoto } from '../__mocks__/utils'

beforeEach(() => {
  jest.clearAllMocks()
  mockScheme.value = 'light'
  mockPhotosState.likedIds = {}
  mockPhotosState.toggleLike = jest.fn()
  mockVotesState.byImageId = {}
  mockVotesState.castVote = jest.fn()
  mockUsePhotosStore.mockImplementation((selector: any) =>
    typeof selector === 'function' ? selector(mockPhotosState) : mockPhotosState
  )
  mockUseVotesStore.mockImplementation((selector: any) =>
    typeof selector === 'function' ? selector(mockVotesState) : mockVotesState
  )
})

describe('PhotoItem', () => {
  it('shows loader before image loads and hides it after onLoadEnd', () => {
    const photo = makePhoto('p1')
    const { getByLabelText, queryByLabelText } = render(<PhotoItem photo={photo} />)

    expect(getByLabelText('Loading image')).toBeTruthy()

    fireEvent(getByLabelText('Cat photo'), 'loadEnd')
    expect(queryByLabelText('Loading image')).toBeNull()
  })

  it('computes image height via calcImageHeight', () => {
    const photo = makePhoto('p1', { width: 1200, height: 800 })
    render(<PhotoItem photo={photo} />)
    expect(mockCalcImageHeight).toHaveBeenCalledWith(1200, 800)
  })

  it('renders the image with the correct URI', () => {
    const photo = makePhoto('p1')
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Cat photo').props.source.uri).toBe(photo.url)
  })

  it('unliked state: heart fill is white and accessible as "Like"', () => {
    mockPhotosState.likedIds = {}
    const photo = makePhoto('p1')
    const { getByLabelText, getByTestId } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Like cat photo').props.accessibilityState?.selected).toBe(false)
    expect(getByTestId('heart').props.fill).toBe('#ffffff')
  })

  it('liked state: heart fill is primary colour and accessible as "Unlike"', () => {
    mockPhotosState.likedIds = { p1: 42 }
    const photo = makePhoto('p1')
    const { getByLabelText, getByTestId } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Unlike cat photo').props.accessibilityState?.selected).toBe(true)
    expect(getByTestId('heart').props.fill).toBe('tomato')
  })

  it('calls toggleLike when pressing the like button', () => {
    const photo = makePhoto('p1')
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    fireEvent.press(getByLabelText('Like cat photo'))
    expect(mockPhotosState.toggleLike).toHaveBeenCalledWith(photo.id)
  })

  it('renders vote up and vote down buttons', () => {
    const photo = makePhoto('p1')
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    expect(getByLabelText('Vote up')).toBeTruthy()
    expect(getByLabelText('Vote down')).toBeTruthy()
  })

  it('pressing vote up calls castVote with value 1', async () => {
    mockVotesState.castVote = jest.fn().mockResolvedValue(undefined)
    const photo = makePhoto('p1')
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    await act(async () => { fireEvent.press(getByLabelText('Vote up')) })
    expect(mockVotesState.castVote).toHaveBeenCalledWith(photo.id, 1)
  })

  it('pressing vote down calls castVote with value 0', async () => {
    mockVotesState.castVote = jest.fn().mockResolvedValue(undefined)
    const photo = makePhoto('p1')
    const { getByLabelText } = render(<PhotoItem photo={photo} />)
    await act(async () => { fireEvent.press(getByLabelText('Vote down')) })
    expect(mockVotesState.castVote).toHaveBeenCalledWith(photo.id, 0)
  })

  it('ignores a second vote press while already voting (isVoting guard)', async () => {
    mockVotesState.castVote = jest.fn(() => new Promise(() => {})) // never resolves
    const photo = makePhoto('p1')
    const { UNSAFE_getByProps } = render(<PhotoItem photo={photo} />)

    const getVoteUp = () => UNSAFE_getByProps({ accessibilityLabel: 'Vote up' })

    act(() => { getVoteUp().props.onPress() })

    await waitFor(() => expect(getVoteUp().props.disabled).toBe(true))

    getVoteUp().props.onPress()
    expect(mockVotesState.castVote).toHaveBeenCalledTimes(1)
  })

  it('shows active style on vote up when userVote is 1', () => {
    mockVotesState.byImageId = { p1: { score: 3, userVote: 1, voteIds: [] } }
    const photo = makePhoto('p1')
    const { getByText } = render(<PhotoItem photo={photo} />)
    expect(getByText('arrow-up')).toBeTruthy()
  })

  it('shows active style on vote down when userVote is 0', () => {
    mockVotesState.byImageId = { p1: { score: -1, userVote: 0, voteIds: [] } }
    const photo = makePhoto('p1')
    const { getByText } = render(<PhotoItem photo={photo} />)
    expect(getByText('arrow-down')).toBeTruthy()
  })

  it('displays the vote score', () => {
    mockVotesState.byImageId = { p1: { score: 7, userVote: null, voteIds: [] } }
    const photo = makePhoto('p1')
    const { getByText } = render(<PhotoItem photo={photo} />)
    expect(getByText('7')).toBeTruthy()
  })
})

describe('PhotoItem — dark scheme', () => {
  beforeEach(() => {
    mockScheme.value = 'dark'
  })

  it('renders without error in dark mode', () => {
    const { getByLabelText } = render(<PhotoItem photo={makePhoto('p1')} />)
    expect(getByLabelText('Cat photo')).toBeTruthy()
  })

  it('uses dark-mode icon colours for vote buttons', () => {
    const { getAllByText } = render(<PhotoItem photo={makePhoto('p1')} />)
    expect(getAllByText('arrow-up-outline').length).toBeGreaterThan(0)
    expect(getAllByText('arrow-down-outline').length).toBeGreaterThan(0)
  })
})
