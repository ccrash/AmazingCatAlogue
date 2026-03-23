import type { Photo } from '@/types/photo'

export const makePhoto = (id: string, overrides: Partial<Photo> = {}): Photo => ({
  id,
  url: `https://example.com/${id}.jpg`,
  width: 100,
  height: 100,
  ...overrides,
})
