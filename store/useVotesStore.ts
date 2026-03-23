import { create } from 'zustand'
import { fetchVotes, castVote, deleteVote } from '@utils/api'

export type VoteInfo = { score: number; userVote: 1 | 0 | null; voteIds: number[] }

export const DEFAULT_VOTE_INFO: VoteInfo = { score: 0, userVote: null, voteIds: [] }

type VotesState = {
  byImageId: Record<string, VoteInfo>
  isLoading: boolean
  error?: string
}

type VotesActions = {
  loadVotes: () => Promise<void>
  castVote: (imageId: string, value: 1 | 0) => Promise<void>
}

export const useVotesStore = create<VotesState & VotesActions>()((set, get) => ({
  byImageId: {},
  isLoading: false,

  loadVotes: async () => {
    set({ isLoading: true, error: undefined })
    try {
      const votes = await fetchVotes()
      const map: Record<string, VoteInfo> = {}
      for (const vote of votes) {
        const entry = map[vote.image_id] ?? { score: 0, userVote: null, voteIds: [] }
        entry.score += vote.value === 1 ? 1 : -1
        entry.userVote = vote.value
        entry.voteIds.push(vote.id)
        map[vote.image_id] = entry
      }
      set({ byImageId: map, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err?.message })
    }
  },

  castVote: async (imageId: string, value: 1 | 0) => {
    const prev = get().byImageId[imageId] ?? DEFAULT_VOTE_INFO

    // No-op: already voted with this value
    if (prev.userVote === value) return

    // Optimistic update
    const prevDelta = prev.userVote === 1 ? 1 : prev.userVote === 0 ? -1 : 0
    const newDelta = value === 1 ? 1 : -1
    set(s => ({
      byImageId: {
        ...s.byImageId,
        [imageId]: {
          score: prev.score - prevDelta + newDelta,
          userVote: value,
          voteIds: [],
        },
      },
    }))

    try {
      await Promise.all(prev.voteIds.map(id => deleteVote(id)))
      const result = await castVote(imageId, value)
      set(s => ({
        byImageId: {
          ...s.byImageId,
          [imageId]: { ...s.byImageId[imageId], voteIds: [result.id] },
        },
      }))
    } catch {
      // Rollback
      set(s => ({ byImageId: { ...s.byImageId, [imageId]: prev } }))
    }
  },
}))
