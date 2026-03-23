import type { Photo } from '@/types/photo'
import type { VoteRecord } from '@/types/vote'
import type { FavouriteRecord } from '@/types/favourite'
import type { Breed } from '@/types/breed'

export const DEFAULT_PAGE_LIMIT = 10

const API_BASE = 'https://api.thecatapi.com/v1'
export const CDN_BASE = 'https://cdn2.thecatapi.com/images'
const API_KEY = process.env.EXPO_PUBLIC_CAT_API_KEY ?? ''
if (__DEV__ && !API_KEY) {
  console.error('[api] EXPO_PUBLIC_CAT_API_KEY is not set. Add it to your .env.local file.')
}

const REQUEST_TIMEOUT_MS = 15_000
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500

type HttpError = Error & { status?: number }

async function fetchJson(url: string, options?: RequestInit) {
  let attempt = 0
  while (true) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const resp = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'x-api-key': API_KEY,
          ...((options?.headers as Record<string, string>) ?? {})
        }
      })
      if (!resp.ok) {
        const err = new Error(`HTTP ${resp.status}`) as HttpError
        err.status = resp.status
        throw err
      }
      return resp.json()
    } catch (err) {
      const isHttpError = (err as HttpError).status != null
      if (isHttpError || attempt >= MAX_RETRIES) throw err
      attempt++
      await new Promise(r => setTimeout(r, RETRY_BASE_DELAY_MS * attempt))
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export async function fetchPhotos(params: { page: number; limit?: number }): Promise<Photo[]> {
  const { page, limit = DEFAULT_PAGE_LIMIT } = params
  return fetchJson(`${API_BASE}/images?limit=${limit}&page=${page}&order=Desc`)
}

export async function uploadImage(uri: string, mimeType: string = 'image/jpeg'): Promise<Photo> {
  const formData = new FormData()
  formData.append('file', { uri, name: 'upload.jpg', type: mimeType } as any)
  return fetchJson(`${API_BASE}/images/upload`, {
    method: 'POST',
    body: formData,
  })
}


export async function searchBreeds(query: string): Promise<Breed[]> {
  return fetchJson(`${API_BASE}/breeds/search?q=${encodeURIComponent(query)}`)
}

export async function fetchAllBreeds(): Promise<Breed[]> {
  return fetchJson(`${API_BASE}/breeds`)
}

export async function fetchVotes(): Promise<VoteRecord[]> {
  return fetchJson(`${API_BASE}/votes`)
}

export async function castVote(imageId: string, value: 1 | 0): Promise<{ message: string; id: number }> {
  return fetchJson(`${API_BASE}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId, value }),
  })
}

export async function fetchFavourites(): Promise<FavouriteRecord[]> {
  return fetchJson(`${API_BASE}/favourites`)
}

export async function addFavourite(imageId: string): Promise<{ message: string; id: number }> {
  return fetchJson(`${API_BASE}/favourites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId }),
  })
}

export async function removeFavourite(favouriteId: number): Promise<{ message: string }> {
  return fetchJson(`${API_BASE}/favourites/${favouriteId}`, { method: 'DELETE' })
}

export async function deleteVote(voteId: number): Promise<{ message: string }> {
  return fetchJson(`${API_BASE}/votes/${voteId}`, { method: 'DELETE' })
}
