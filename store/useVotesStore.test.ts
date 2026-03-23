import { useVotesStore, DEFAULT_VOTE_INFO } from '@store/useVotesStore'

jest.mock('@utils/api', () => ({
  fetchVotes: jest.fn(),
  castVote: jest.fn(),
  deleteVote: jest.fn(),
}))

import { fetchVotes as mockFetchVotes, castVote as mockCastVote, deleteVote as mockDeleteVote } from '@utils/api'

const INITIAL_STATE = {
  byImageId: {},
  isLoading: false,
  error: undefined,
}

beforeEach(() => {
  jest.clearAllMocks()
  useVotesStore.setState(INITIAL_STATE)
})

describe('initial state', () => {
  it('has correct defaults', () => {
    const s = useVotesStore.getState()
    expect(s.byImageId).toEqual({})
    expect(s.isLoading).toBe(false)
  })
})

describe('DEFAULT_VOTE_INFO', () => {
  it('has zero score, null userVote and empty voteIds', () => {
    expect(DEFAULT_VOTE_INFO).toEqual({ score: 0, userVote: null, voteIds: [] })
  })
})

describe('loadVotes', () => {
  it('aggregates scores, records last userVote, and collects all voteIds', async () => {
    const votes = [
      { id: 1, image_id: 'img1', value: 1 },
      { id: 2, image_id: 'img1', value: 1 },
      { id: 3, image_id: 'img2', value: 0 },
    ]
    ;(mockFetchVotes as jest.Mock).mockResolvedValue(votes)
    await useVotesStore.getState().loadVotes()
    const s = useVotesStore.getState()
    expect(s.isLoading).toBe(false)
    expect(s.byImageId['img1']).toEqual({ score: 2, userVote: 1, voteIds: [1, 2] })
    expect(s.byImageId['img2']).toEqual({ score: -1, userVote: 0, voteIds: [3] })
  })

  it('sets error and clears isLoading on failure', async () => {
    ;(mockFetchVotes as jest.Mock).mockRejectedValue(new Error('Network fail'))
    await useVotesStore.getState().loadVotes()
    const s = useVotesStore.getState()
    expect(s.isLoading).toBe(false)
    expect(s.error).toBe('Network fail')
  })
})

describe('castVote', () => {
  it('applies optimistic update, calls castVote API, and sets voteIds', async () => {
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS', id: 1 })
    await useVotesStore.getState().castVote('img1', 1)
    expect(mockCastVote).toHaveBeenCalledWith('img1', 1)
    expect(useVotesStore.getState().byImageId['img1']).toEqual({ score: 1, userVote: 1, voteIds: [1] })
  })

  it('decrements score on downvote from null', async () => {
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS', id: 2 })
    await useVotesStore.getState().castVote('img1', 0)
    expect(useVotesStore.getState().byImageId['img1'].score).toBe(-1)
    expect(useVotesStore.getState().byImageId['img1'].userVote).toBe(0)
  })

  it('deletes ALL accumulated old votes before casting a new one', async () => {
    useVotesStore.setState({
      byImageId: { img1: { score: 1, userVote: 1, voteIds: [10, 11] } },
    })
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS', id: 5 })
    await useVotesStore.getState().castVote('img1', 0)
    expect(mockDeleteVote).toHaveBeenCalledWith(10)
    expect(mockDeleteVote).toHaveBeenCalledWith(11)
    expect(mockCastVote).toHaveBeenCalledWith('img1', 0)
    expect(useVotesStore.getState().byImageId['img1']).toEqual({ score: -1, userVote: 0, voteIds: [5] })
  })

  it('is a no-op when re-voting with the same value', async () => {
    useVotesStore.setState({ byImageId: { img1: { score: 1, userVote: 1, voteIds: [1] } } })
    await useVotesStore.getState().castVote('img1', 1)
    expect(mockCastVote).not.toHaveBeenCalled()
    expect(mockDeleteVote).not.toHaveBeenCalled()
  })

  it('rolls back optimistic update when castVote API throws', async () => {
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockRejectedValue(new Error('fail'))
    await useVotesStore.getState().castVote('img1', 1)
    // should be rolled back to DEFAULT_VOTE_INFO
    expect(useVotesStore.getState().byImageId['img1']).toEqual(DEFAULT_VOTE_INFO)
  })

  it('switches from downvote to upvote with correct +2 delta', async () => {
    useVotesStore.setState({ byImageId: { img1: { score: -1, userVote: 0, voteIds: [42] } } })
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS', id: 99 })
    await useVotesStore.getState().castVote('img1', 1)
    expect(useVotesStore.getState().byImageId['img1'].score).toBe(1)
    expect(useVotesStore.getState().byImageId['img1'].userVote).toBe(1)
  })

  it('updates independently for different images', async () => {
    ;(mockDeleteVote as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    ;(mockCastVote as jest.Mock).mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 })
    await useVotesStore.getState().castVote('img1', 1)
    await useVotesStore.getState().castVote('img2', 0)
    expect(useVotesStore.getState().byImageId['img1'].score).toBe(1)
    expect(useVotesStore.getState().byImageId['img2'].score).toBe(-1)
  })
})
