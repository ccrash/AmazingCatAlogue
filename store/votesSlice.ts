import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { fetchVotes, castVote } from '@utils/api'

type VoteInfo = { score: number; userVote: 1 | 0 | null }

type VotesState = {
  byImageId: Record<string, VoteInfo>
  isLoading: boolean
  error?: string
}

const initialState: VotesState = {
  byImageId: {},
  isLoading: false,
}

export const loadVotes = createAsyncThunk('votes/load', async () => {
  return fetchVotes()
})

export const castVoteThunk = createAsyncThunk<
  void,
  { imageId: string; value: 1 | 0 },
  { state: RootState }
>('votes/cast', async ({ imageId, value }, { dispatch, getState }) => {
  const prev = getState().votes.byImageId[imageId] ?? { score: 0, userVote: null }

  // Optimistic update
  dispatch(applyOptimisticVote({ imageId, value, prev }))

  try {
    await castVote(imageId, value)
  } catch (err) {
    // Roll back on failure
    dispatch(rollbackVote({ imageId, prev }))
    throw err
  }
})

const votesSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    applyOptimisticVote(
      state,
      action: { payload: { imageId: string; value: 1 | 0; prev: VoteInfo } }
    ) {
      const { imageId, value, prev } = action.payload
      const scoreDelta = value === 1 ? 1 : -1
      state.byImageId[imageId] = {
        score: prev.score + scoreDelta,
        userVote: value,
      }
    },
    rollbackVote(
      state,
      action: { payload: { imageId: string; prev: VoteInfo } }
    ) {
      const { imageId, prev } = action.payload
      state.byImageId[imageId] = prev
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadVotes.pending, state => {
        state.isLoading = true
        state.error = undefined
      })
      .addCase(loadVotes.fulfilled, (state, action) => {
        state.isLoading = false
        const map: Record<string, VoteInfo> = {}
        for (const vote of action.payload) {
          const entry = map[vote.image_id] ?? { score: 0, userVote: null }
          entry.score += vote.value === 1 ? 1 : -1
          entry.userVote = vote.value  // last vote wins for userVote
          map[vote.image_id] = entry
        }
        state.byImageId = map
      })
      .addCase(loadVotes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  },
})

export const { applyOptimisticVote, rollbackVote } = votesSlice.actions

export const selectVoteInfo = (imageId: string) =>
  (s: RootState): VoteInfo => s.votes.byImageId[imageId] ?? { score: 0, userVote: null }

export default votesSlice.reducer
