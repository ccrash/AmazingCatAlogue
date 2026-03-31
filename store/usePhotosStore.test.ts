import { usePhotosStore, selectAllPhotos, selectLikedPhotos, selectIsLiked } from '@store/usePhotosStore'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}))

jest.mock('@utils/api', () => ({
  fetchPhotos: jest.fn(),
  uploadImage: jest.fn(),
  fetchFavourites: jest.fn(),
  addFavourite: jest.fn(),
  removeFavourite: jest.fn(),
  DEFAULT_PAGE_LIMIT: 10,
}))

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native')
  rn.Image.prefetch = jest.fn().mockResolvedValue(true)
  return rn
})

import {
  fetchPhotos as mockFetchPhotos,
  uploadImage as mockUploadImage,
  fetchFavourites as mockFetchFavourites,
  addFavourite as mockAddFavourite,
  removeFavourite as mockRemoveFavourite,
} from '@utils/api'
import { makePhoto } from '../__mocks__/utils'

const INITIAL_STATE = {
  entities: {},
  ids: [],
  page: -1,
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  likedIds: {},
  error: undefined,
}


beforeEach(() => {
  jest.clearAllMocks()
  usePhotosStore.setState(INITIAL_STATE)
})

describe('initial state', () => {
  it('has correct defaults', () => {
    const s = usePhotosStore.getState()
    expect(s.page).toBe(-1)
    expect(s.isLoading).toBe(false)
    expect(s.isFetchingMore).toBe(false)
    expect(s.hasMore).toBe(true)
    expect(s.likedIds).toEqual({})
    expect(s.ids).toHaveLength(0)
  })
})

describe('loadNextPage', () => {
  it('fetches photos and updates state', async () => {
    const photos = [makePhoto('p1'), makePhoto('p2')]
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue(photos)
    await usePhotosStore.getState().loadNextPage()
    const s = usePhotosStore.getState()
    expect(s.page).toBe(0)
    expect(s.ids).toContain('p1')
    expect(s.ids).toContain('p2')
    expect(s.isLoading).toBe(false)
  })

  it('sets isLoading=true on first page, isFetchingMore=true on subsequent', async () => {
    const photos = new Array(10).fill(null).map((_, i) => makePhoto(`p${i}`))
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue(photos)
    await usePhotosStore.getState().loadNextPage()
    // page is now 0 — next call should use isFetchingMore
    ;(mockFetchPhotos as jest.Mock).mockReturnValue(new Promise(() => {})) // never resolves
    usePhotosStore.getState().loadNextPage()
    expect(usePhotosStore.getState().isFetchingMore).toBe(true)
    expect(usePhotosStore.getState().isLoading).toBe(false)
  })

  it('sets hasMore=false when fewer photos than limit are returned', async () => {
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    await usePhotosStore.getState().loadNextPage()
    expect(usePhotosStore.getState().hasMore).toBe(false)
  })

  it('sets hasMore=true when a full page is returned', async () => {
    const photos = new Array(10).fill(null).map((_, i) => makePhoto(`p${i}`))
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue(photos)
    await usePhotosStore.getState().loadNextPage()
    expect(usePhotosStore.getState().hasMore).toBe(true)
  })

  it('sets error when fetch fails', async () => {
    ;(mockFetchPhotos as jest.Mock).mockRejectedValue(new Error('timeout'))
    await usePhotosStore.getState().loadNextPage()
    expect(usePhotosStore.getState().error).toBe('timeout')
    expect(usePhotosStore.getState().isLoading).toBe(false)
  })

  it('is a no-op when already loading', async () => {
    usePhotosStore.setState({ isLoading: true })
    await usePhotosStore.getState().loadNextPage()
    expect(mockFetchPhotos).not.toHaveBeenCalled()
  })

  it('is a no-op when already fetching more', async () => {
    usePhotosStore.setState({ isFetchingMore: true })
    await usePhotosStore.getState().loadNextPage()
    expect(mockFetchPhotos).not.toHaveBeenCalled()
  })

  it('is a no-op when hasMore is false', async () => {
    usePhotosStore.setState({ hasMore: false })
    await usePhotosStore.getState().loadNextPage()
    expect(mockFetchPhotos).not.toHaveBeenCalled()
  })

  it('does not push duplicate IDs when a photo already exists in entities', async () => {
    const photo = makePhoto('p1')
    usePhotosStore.setState({ entities: { p1: photo }, ids: ['p1'], page: 0 })
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([photo])
    await usePhotosStore.getState().loadNextPage()
    const { ids } = usePhotosStore.getState()
    expect(ids.filter(id => id === 'p1')).toHaveLength(1)
  })
})

describe('reset', () => {
  it('clears photos and resets pagination', async () => {
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    await usePhotosStore.getState().loadNextPage()
    usePhotosStore.getState().reset()
    const s = usePhotosStore.getState()
    expect(s.page).toBe(-1)
    expect(s.ids).toHaveLength(0)
    expect(s.isLoading).toBe(false)
    expect(s.hasMore).toBe(true)
  })

  it('preserves likedIds after reset', async () => {
    usePhotosStore.setState({ likedIds: { p1: 7 } })
    usePhotosStore.getState().reset()
    expect(usePhotosStore.getState().likedIds['p1']).toBe(7)
  })
})

describe('loadFavourites', () => {
  it('replaces likedIds with image_id → favourite_id from API', async () => {
    const favs = [
      { id: 10, image_id: 'img1', created_at: '' },
      { id: 20, image_id: 'img2', created_at: '' },
    ]
    ;(mockFetchFavourites as jest.Mock).mockResolvedValue(favs)
    await usePhotosStore.getState().loadFavourites()
    expect(usePhotosStore.getState().likedIds).toEqual({ img1: 10, img2: 20 })
  })

  it('overwrites previously persisted likedIds', async () => {
    usePhotosStore.setState({ likedIds: { old: 99 } })
    ;(mockFetchFavourites as jest.Mock).mockResolvedValue([{ id: 5, image_id: 'new', created_at: '' }])
    await usePhotosStore.getState().loadFavourites()
    expect(usePhotosStore.getState().likedIds).toEqual({ new: 5 })
    expect(usePhotosStore.getState().likedIds['old']).toBeUndefined()
  })

  it('sets likedIds to empty object when no favourites exist', async () => {
    usePhotosStore.setState({ likedIds: { p1: 1 } })
    ;(mockFetchFavourites as jest.Mock).mockResolvedValue([])
    await usePhotosStore.getState().loadFavourites()
    expect(usePhotosStore.getState().likedIds).toEqual({})
  })

  it('silently ignores errors', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    ;(mockFetchFavourites as jest.Mock).mockRejectedValue(new Error('network'))
    await expect(usePhotosStore.getState().loadFavourites()).resolves.toBeUndefined()
  })
})

describe('uploadPhoto', () => {
  it('calls uploadImage, clears list and loads next page', async () => {
    ;(mockUploadImage as jest.Mock).mockResolvedValue({})
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    const asset = { uri: 'file:///cat.jpg', mimeType: 'image/jpeg' } as any
    await usePhotosStore.getState().uploadPhoto(asset)
    expect(mockUploadImage).toHaveBeenCalledWith('file:///cat.jpg', 'image/jpeg')
    expect(usePhotosStore.getState().ids).toContain('p1')
  })

  it('falls back to image/jpeg when mimeType is undefined', async () => {
    ;(mockUploadImage as jest.Mock).mockResolvedValue({})
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([])
    const asset = { uri: 'file:///cat.jpg', mimeType: undefined } as any
    await usePhotosStore.getState().uploadPhoto(asset)
    expect(mockUploadImage).toHaveBeenCalledWith('file:///cat.jpg', 'image/jpeg')
  })

  it('throws when uploadImage fails', async () => {
    ;(mockUploadImage as jest.Mock).mockRejectedValue(new Error('server error'))
    const asset = { uri: 'file:///cat.jpg', mimeType: 'image/jpeg' } as any
    await expect(usePhotosStore.getState().uploadPhoto(asset)).rejects.toThrow('server error')
  })
})

describe('toggleLike', () => {
  it('calls addFavourite and stores the returned favouriteId', async () => {
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    ;(mockAddFavourite as jest.Mock).mockResolvedValue({ id: 42, message: 'SUCCESS' })
    await usePhotosStore.getState().loadNextPage()
    await usePhotosStore.getState().toggleLike('p1')
    expect(mockAddFavourite).toHaveBeenCalledWith('p1')
    expect(usePhotosStore.getState().likedIds['p1']).toBe(42)
  })

  it('prefetches the image after liking', async () => {
    const { Image } = require('react-native')
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    ;(mockAddFavourite as jest.Mock).mockResolvedValue({ id: 5, message: 'SUCCESS' })
    await usePhotosStore.getState().loadNextPage()
    await usePhotosStore.getState().toggleLike('p1')
    expect(Image.prefetch).toHaveBeenCalledWith(expect.stringContaining('p1'))
  })

  it('calls removeFavourite with the stored favouriteId when unliking', async () => {
    usePhotosStore.setState({ likedIds: { p1: 77 } })
    ;(mockRemoveFavourite as jest.Mock).mockResolvedValue({ message: 'SUCCESS' })
    await usePhotosStore.getState().toggleLike('p1')
    expect(mockRemoveFavourite).toHaveBeenCalledWith(77)
    expect(usePhotosStore.getState().likedIds['p1']).toBeUndefined()
  })

  it('rolls back when addFavourite fails', async () => {
    ;(mockAddFavourite as jest.Mock).mockRejectedValue(new Error('network'))
    await usePhotosStore.getState().toggleLike('p1')
    expect(usePhotosStore.getState().likedIds['p1']).toBeUndefined()
  })

  it('rolls back when removeFavourite fails', async () => {
    usePhotosStore.setState({ likedIds: { p1: 99 } })
    ;(mockRemoveFavourite as jest.Mock).mockRejectedValue(new Error('network'))
    await usePhotosStore.getState().toggleLike('p1')
    expect(usePhotosStore.getState().likedIds['p1']).toBe(99)
  })

  it('skips prefetch when the photo entity is not in the store', async () => {
    const { Image } = require('react-native')
    ;(mockAddFavourite as jest.Mock).mockResolvedValue({ id: 5, message: 'SUCCESS' })
    // 'unknown' has no entity loaded
    await usePhotosStore.getState().toggleLike('unknown')
    expect(Image.prefetch).not.toHaveBeenCalled()
    expect(usePhotosStore.getState().likedIds['unknown']).toBe(5)
  })

  it('swallows prefetch errors silently', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { Image } = require('react-native')
    ;(mockFetchPhotos as jest.Mock).mockResolvedValue([makePhoto('p1')])
    ;(mockAddFavourite as jest.Mock).mockResolvedValue({ id: 8, message: 'SUCCESS' })
    Image.prefetch.mockRejectedValueOnce(new Error('prefetch failed'))
    await usePhotosStore.getState().loadNextPage()
    await expect(usePhotosStore.getState().toggleLike('p1')).resolves.toBeUndefined()
    expect(usePhotosStore.getState().likedIds['p1']).toBe(8)
  })
})

describe('persist merge', () => {
  it('uses empty defaults when persisted state is missing fields', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage')
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ state: {}, version: 0 })
    )
    await usePhotosStore.persist.rehydrate()
    const s = usePhotosStore.getState()
    expect(s.likedIds).toEqual({})
    expect(s.entities).toEqual({})
    expect(s.ids).toEqual([])
  })
})

describe('selectors', () => {
  it('selectAllPhotos returns photos in insertion order', () => {
    usePhotosStore.setState({
      ids: ['p1', 'p2'],
      entities: { p1: makePhoto('p1'), p2: makePhoto('p2') },
    })
    const all = selectAllPhotos(usePhotosStore.getState())
    expect(all.map(p => p.id)).toEqual(['p1', 'p2'])
  })

  it('selectIsLiked returns true for a liked photo', () => {
    usePhotosStore.setState({ likedIds: { p1: 3 } })
    expect(selectIsLiked('p1')(usePhotosStore.getState())).toBe(true)
  })

  it('selectIsLiked returns true for an optimistic pending photo (-1)', () => {
    usePhotosStore.setState({ likedIds: { p1: -1 } })
    expect(selectIsLiked('p1')(usePhotosStore.getState())).toBe(true)
  })

  it('selectIsLiked returns false for an unliked photo', () => {
    expect(selectIsLiked('p1')(usePhotosStore.getState())).toBe(false)
  })

  it('selectLikedPhotos returns only liked photos', () => {
    usePhotosStore.setState({
      ids: ['p1', 'p2'],
      entities: { p1: makePhoto('p1'), p2: makePhoto('p2') },
      likedIds: { p1: 10 },
    })
    const liked = selectLikedPhotos(usePhotosStore.getState())
    expect(liked).toHaveLength(1)
    expect(liked[0].id).toBe('p1')
  })

  it('selectLikedPhotos returns empty array when nothing is liked', () => {
    usePhotosStore.setState({
      ids: ['p1'],
      entities: { p1: makePhoto('p1') },
      likedIds: {},
    })
    expect(selectLikedPhotos(usePhotosStore.getState())).toHaveLength(0)
  })
})
