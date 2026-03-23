import {
  fetchPhotos,
  uploadImage,
  searchBreeds,
  fetchAllBreeds,
  fetchVotes,
  castVote,
  fetchFavourites,
  addFavourite,
  removeFavourite,
  DEFAULT_PAGE_LIMIT,
} from './api'

const API_BASE = 'https://api.thecatapi.com/v1'

const mockFetchOk = (data: unknown, status = 200) => {
  ;(global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => data,
  })
}

const mockFetchNotOk = (status: number) => {
  ;(global as any).fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  })
}

describe('api timeout / abort', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
    ;(global as any).fetch = undefined
  })

  it('calls abort() on the controller after 15 seconds', () => {
    jest.useFakeTimers()
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort')
    ;(global as any).fetch = jest.fn(() => new Promise(() => {}))

    fetchPhotos({ page: 0 }).catch(() => {})
    jest.runAllTimers()

    expect(abortSpy).toHaveBeenCalled()
    abortSpy.mockRestore()
  })
})

describe('api.fetchPhotos', () => {
  afterEach(() => {
    jest.resetAllMocks()
    ;(global as any).fetch = undefined
  })

  it('exports DEFAULT_PAGE_LIMIT = 10', () => {
    expect(DEFAULT_PAGE_LIMIT).toBe(10)
  })

  it('uses the default limit and order=Desc when not provided', async () => {
    const data = [{ id: '1', url: 'https://example.com/cat.jpg', width: 800, height: 600 }]
    mockFetchOk(data)

    const res = await fetchPhotos({ page: 0 })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/images?limit=10&page=0&order=Desc`)
    expect(options.headers['x-api-key']).toBeDefined()
    expect(res).toBe(data)
  })

  it('uses a custom limit when provided', async () => {
    const data = [{ id: 'x', url: 'https://example.com/cat2.jpg', width: 400, height: 300 }]
    mockFetchOk(data)

    const res = await fetchPhotos({ page: 2, limit: 5 })

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/images?limit=5&page=2&order=Desc`)
    expect(res).toBe(data)
  })

  it('throws an error with status when the response is not ok', async () => {
    mockFetchNotOk(503)

    await expect(fetchPhotos({ page: 0 })).rejects.toMatchObject({
      message: 'HTTP 503',
      status: 503,
    })
  })
})

describe('api.uploadImage', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('POSTs FormData to /images/upload and returns the response', async () => {
    const data = { id: 'new1', url: 'https://example.com/new.jpg', width: 100, height: 100 }
    mockFetchOk(data)

    const res = await uploadImage('file:///tmp/cat.jpg', 'image/jpeg')

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/images/upload`)
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(res).toBe(data)
  })

  it('uses image/jpeg as default mimeType', async () => {
    mockFetchOk({})
    await uploadImage('file:///tmp/cat.jpg')
    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.body).toBeInstanceOf(FormData)
  })
})


describe('api.searchBreeds', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('GETs /breeds/search with encoded query', async () => {
    const data = [{ id: 'beng', name: 'Bengal' }]
    mockFetchOk(data)

    const res = await searchBreeds('beng al')

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/breeds/search?q=beng%20al`)
    expect(res).toBe(data)
  })
})

describe('api.fetchAllBreeds', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('GETs /breeds and returns response', async () => {
    const data = [{ id: 'abys', name: 'Abyssinian' }]
    mockFetchOk(data)

    const res = await fetchAllBreeds()

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/breeds`)
    expect(res).toBe(data)
  })
})

describe('api.fetchVotes', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('GETs /votes and returns response', async () => {
    const data = [{ image_id: 'img1', value: 1 }]
    mockFetchOk(data)

    const res = await fetchVotes()

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/votes`)
    expect(res).toBe(data)
  })
})

describe('api.castVote', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('POSTs to /votes with image_id and value', async () => {
    const data = { message: 'SUCCESS', id: 7 }
    mockFetchOk(data)

    const res = await castVote('img1', 1)

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/votes`)
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ image_id: 'img1', value: 1 })
    expect(res).toBe(data)
  })

  it('POSTs a downvote (value 0)', async () => {
    mockFetchOk({ message: 'SUCCESS', id: 8 })
    await castVote('img2', 0)
    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ image_id: 'img2', value: 0 })
  })
})

describe('api.fetchFavourites', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('GETs /favourites and returns response', async () => {
    const data = [{ id: 10, image_id: 'img1', created_at: '2024-01-01' }]
    mockFetchOk(data)

    const res = await fetchFavourites()

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/favourites`)
    expect(res).toBe(data)
  })
})

describe('api.addFavourite', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('POSTs to /favourites with image_id and returns id', async () => {
    const data = { message: 'SUCCESS', id: 42 }
    mockFetchOk(data)

    const res = await addFavourite('img1')

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/favourites`)
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ image_id: 'img1' })
    expect(res).toBe(data)
  })

  it('throws when the response is not ok', async () => {
    mockFetchNotOk(422)
    await expect(addFavourite('img1')).rejects.toMatchObject({ message: 'HTTP 422' })
  })
})

describe('api.removeFavourite', () => {
  afterEach(() => { jest.resetAllMocks(); (global as any).fetch = undefined })

  it('DELETEs /favourites/:id and returns response', async () => {
    const data = { message: 'SUCCESS' }
    mockFetchOk(data)

    const res = await removeFavourite(42)

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(`${API_BASE}/favourites/42`)
    expect(options.method).toBe('DELETE')
    expect(res).toBe(data)
  })

  it('throws when the response is not ok', async () => {
    mockFetchNotOk(404)
    await expect(removeFavourite(99)).rejects.toMatchObject({ message: 'HTTP 404' })
  })
})
