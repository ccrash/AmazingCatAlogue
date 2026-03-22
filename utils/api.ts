import type { Photo } from '@/types/photo'
import type { VoteRecord } from '@/types/vote'

export const DEFAULT_PAGE_LIMIT = 10

const API_BASE = 'https://api.thecatapi.com/v1'
const API_KEY = process.env.EXPO_PUBLIC_CAT_API_KEY ?? ''

type HttpError = Error & { status?: number }

async function fetchJson(url: string, options?: RequestInit) {
  const resp = await fetch(url, {
    ...options,
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

export async function addFavourite(imageId: string): Promise<{ message: string; id: number }> {
  return fetchJson(`${API_BASE}/favourites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId }),
  })
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
