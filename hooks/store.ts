import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, StoreDispatch } from '@src/store'

export const useStoreDispatch = () => useDispatch<StoreDispatch>()
export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector