import { configureStore, combineReducers } from '@reduxjs/toolkit'
import photosReducer from '@store/photosSlice'
import themeReducer from '@store/themeSlice'
import votesReducer from '@store/votesSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer, persistStore, createTransform } from 'redux-persist'

const keepOnlyLiked = createTransform(
  (inboundState: any) => {
    const likedIds: Record<string, true> = inboundState?.likedIds ?? {}
    const entities = Object.keys(likedIds).reduce((acc: Record<string, any>, id) => {
      const p = inboundState?.entities?.[id]
      if (p) acc[id] = p
      return acc
    }, {})
    const ids = Object.keys(entities)
    return { ...inboundState, entities, ids }
  },
  (outboundState: any) => ({
    ...outboundState,
    page: -1,
    isLoading: false,
    isFetchingMore: false,
    hasMore: true,
    error: undefined
  }),
  { whitelist: ['photos'] }
)

const themePersistConfig = {
  key: 'theme',
  storage: AsyncStorage,
  whitelist: ['mode']
}

const photosPersistConfig = {
  key: 'photos',
  storage: AsyncStorage,
  transforms: [keepOnlyLiked]
}

const rootReducer = combineReducers({
  photos: persistReducer(photosPersistConfig, photosReducer),
  theme: persistReducer(themePersistConfig, themeReducer),
  votes: votesReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch
