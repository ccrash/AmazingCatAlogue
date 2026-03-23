import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'react-native'
import type { ImagePickerAsset } from 'expo-image-picker'
import {
  fetchPhotos,
  uploadImage,
  DEFAULT_PAGE_LIMIT,
  fetchFavourites,
  addFavourite,
  removeFavourite,
} from '@utils/api'
import type { Photo } from '../types/photo'

type PhotosState = {
  entities: Record<string, Photo>
  ids: string[]
  page: number
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  /** imageId → favouriteId from API. -1 = optimistic pending. */
  likedIds: Record<string, number>
  error?: string
}

type PhotosActions = {
  loadNextPage: () => Promise<void>
  loadFavourites: () => Promise<void>
  uploadPhoto: (asset: ImagePickerAsset) => Promise<void>
  toggleLike: (id: string) => Promise<void>
  reset: () => void
}

const INITIAL_STATE: PhotosState = {
  entities: {},
  ids: [],
  page: -1,
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  likedIds: {},
}

export const usePhotosStore = create<PhotosState & PhotosActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      loadNextPage: async () => {
        const { page, isLoading, isFetchingMore, hasMore } = get()
        if (isLoading || isFetchingMore || !hasMore) return

        const isFirstPage = page < 0
        set(isFirstPage ? { isLoading: true, error: undefined } : { isFetchingMore: true, error: undefined })

        try {
          const next = page + 1
          const batch = await fetchPhotos({ page: next, limit: DEFAULT_PAGE_LIMIT })

          set(s => {
            const newEntities = { ...s.entities }
            const newIds = [...s.ids]
            for (const photo of batch) {
              if (!newEntities[photo.id]) newIds.push(photo.id)
              newEntities[photo.id] = photo
            }
            return {
              entities: newEntities,
              ids: newIds,
              page: next,
              isLoading: false,
              isFetchingMore: false,
              hasMore: batch.length >= DEFAULT_PAGE_LIMIT,
            }
          })
        } catch (err: unknown) {
          set({ isLoading: false, isFetchingMore: false, error: (err as Error)?.message })
        }
      },

      loadFavourites: async () => {
        try {
          const favs = await fetchFavourites()
          const likedIds: Record<string, number> = {}
          for (const fav of favs) {
            likedIds[fav.image_id] = fav.id
          }
          set({ likedIds })
        } catch {
          // non-fatal — silently ignore
        }
      },

      uploadPhoto: async (asset: ImagePickerAsset) => {
        await uploadImage(asset.uri, asset.mimeType ?? 'image/jpeg')
        // Reset list then reload first page
        set(s => ({
          entities: s.entities,
          ids: s.ids,
          page: -1,
          isLoading: false,
          isFetchingMore: false,
          hasMore: true,
          error: undefined,
          likedIds: s.likedIds,
        }))
        // Fully clear entities/ids so the new photo appears at top
        set({ entities: {}, ids: [] })
        await get().loadNextPage()
      },

      toggleLike: async (id: string) => {
        const { likedIds } = get()
        const favouriteId = likedIds[id]
        const isLiked = typeof favouriteId === 'number' && favouriteId > 0

        if (isLiked) {
          // Optimistic remove
          set(s => {
            const next = { ...s.likedIds }
            delete next[id]
            return { likedIds: next }
          })
          try {
            await removeFavourite(favouriteId)
          } catch {
            // Rollback
            set(s => ({ likedIds: { ...s.likedIds, [id]: favouriteId } }))
          }
        } else {
          // Optimistic add
          set(s => ({ likedIds: { ...s.likedIds, [id]: -1 } }))
          try {
            const result = await addFavourite(id)
            set(s => ({ likedIds: { ...s.likedIds, [id]: result.id } }))
            const photo = get().entities[id]
            if (photo) {
              try { await Image.prefetch(photo.url) } catch {}
            }
          } catch {
            // Rollback
            set(s => {
              const next = { ...s.likedIds }
              delete next[id]
              return { likedIds: next }
            })
          }
        }
      },

      reset: () => {
        const { likedIds } = get()
        set({ ...INITIAL_STATE, likedIds })
      },
    }),
    {
      name: 'photos',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // Persist only likedIds + the photo data for liked photos
        const entities: Record<string, Photo> = {}
        for (const id of Object.keys(state.likedIds)) {
          if (state.entities[id]) entities[id] = state.entities[id]
        }
        return {
          likedIds: state.likedIds,
          entities,
          ids: Object.keys(entities),
        }
      },
      merge: (persisted, current) => ({
        ...current,
        likedIds: (persisted as Partial<PhotosState>).likedIds ?? {},
        entities: (persisted as Partial<PhotosState>).entities ?? {},
        ids: (persisted as Partial<PhotosState>).ids ?? [],
        // Always reset pagination on rehydration
        page: -1,
        isLoading: false,
        isFetchingMore: false,
        hasMore: true,
      }),
    }
  )
)

// Selectors
export const selectAllPhotos = (s: PhotosState & PhotosActions) =>
  s.ids.map(id => s.entities[id]).filter(Boolean) as Photo[]

export const selectLikedPhotos = (s: PhotosState & PhotosActions) =>
  Object.keys(s.likedIds)
    .filter(id => s.likedIds[id] > 0)
    .map(id => s.entities[id])
    .filter(Boolean) as Photo[]

export const selectIsLiked = (id: string) => (s: PhotosState & PhotosActions) =>
  id in s.likedIds
