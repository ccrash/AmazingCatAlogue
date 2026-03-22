import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { fetchPhotos, uploadImage, addFavourite, DEFAULT_PAGE_LIMIT } from '@utils/api'
import type { Photo } from '../types/photo'
import { Image } from 'react-native'
import type { ImagePickerAsset } from 'expo-image-picker'

const photosAdapter = createEntityAdapter<Photo>()

type PhotosState = {
  page: number
  isLoading: boolean
  error?: string | undefined
  hasMore: boolean
  likedIds: Record<string, true>
  isFetchingMore: boolean
}

const initialState = photosAdapter.getInitialState<PhotosState>({
  page: -1,
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  likedIds: {}
})

export const toggleLikeAndCache = createAsyncThunk<void, string, { state: RootState }>(
  'photos/toggleLikeAndCache',
  async (id, { dispatch, getState }) => {
    dispatch(toggleLike(id))
    const photo = photosSelectors.selectById(getState(), id)
    if (photo) {
      try { await Image.prefetch(photo.url) } catch (error) { console.error('Image prefetch failed:', error) }
    }
  }
)

export const uploadAndFavourite = createAsyncThunk<void, ImagePickerAsset, { state: RootState }>(
  'photos/uploadAndFavourite',
  async (asset, { dispatch }) => {
    const photo = await uploadImage(asset.uri, asset.mimeType ?? 'image/jpeg')
    await addFavourite(photo.id)
    dispatch(toggleLike(photo.id))
    dispatch(resetPhotos())
    dispatch(loadNextPage())
  }
)

export const loadNextPage = createAsyncThunk<Photo[], void, { state: RootState }>(
  'photos/loadNextPage',
  async (_, { getState }) => {
    const state = getState() as RootState & { photos: typeof initialState }
    const next = state.photos.page + 1
    const batch = await fetchPhotos({ page: next, limit: DEFAULT_PAGE_LIMIT })
    return batch
  }
)

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    reset: () => initialState,
    resetPhotos: state => {
      const liked = state.likedIds
      photosAdapter.removeAll(state)
      state.page = -1
      state.isLoading = false
      state.isFetchingMore = false
      state.hasMore = true
      state.error = undefined
      state.likedIds = liked
    },
    toggleLike(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.likedIds[id]) {
        delete state.likedIds[id]
      } else {
        state.likedIds[id] = true
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loadNextPage.pending, state => {
        state.isLoading = state.page < 0
        state.isFetchingMore = state.page >= 0
        state.error = undefined
      })
      .addCase(loadNextPage.fulfilled, (state, action) => {
        photosAdapter.upsertMany(state, action.payload)
        state.page += 1
        state.isLoading = false
        state.isFetchingMore = false
        state.hasMore = action.payload.length >= DEFAULT_PAGE_LIMIT
      })
      .addCase(loadNextPage.rejected, (state, action) => {
        state.isLoading = false
        state.isFetchingMore = false
        state.error = action.error.message
      })
  }
})

export const { toggleLike, resetPhotos } = photosSlice.actions


export const selectPhotosState = (s: RootState) => (s as RootState & { photos: typeof initialState }).photos
export const selectPage = (s: RootState) => selectPhotosState(s).page
export const selectIsLoading = (s: RootState) => selectPhotosState(s).isLoading
export const selectIsFetchingMore = (s: RootState) => selectPhotosState(s).isFetchingMore
export const selectHasMore = (s: RootState) => selectPhotosState(s).hasMore

export const photosSelectors = photosAdapter.getSelectors<RootState>(selectPhotosState)

export const selectIsLiked = (id: string) =>
  (s: RootState) => Boolean((selectPhotosState(s).likedIds as Record<string, true>)[id])

const selectLikedIds = createSelector(selectPhotosState, ps => ps.likedIds)

export const selectLikedPhotos = createSelector(
  [photosSelectors.selectAll, selectLikedIds],
  (all, liked) => all.filter(p => liked[p.id])
)

export default photosSlice.reducer
