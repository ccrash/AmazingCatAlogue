import { fetchPhotos, DEFAULT_PAGE_LIMIT } from './api'

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
