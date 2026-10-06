import axios from 'axios'
import { fetchBundle, FETCH_BUNDLE_TIMEOUT_MS, MAX_BUNDLE_BYTES } from './fetchBundle'

jest.mock('axios')
jest.mock('request-filtering-agent', () => ({
  useAgent: jest.fn(() => 'filtering-agent'),
}))

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>

describe('Metriport - fetchBundle', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  test('Should return the bundle the URL serves', async () => {
    const bundle = { resourceType: 'Bundle', type: 'collection' }
    mockedGet.mockResolvedValue({ data: bundle })

    await expect(fetchBundle('https://example.com/bundle')).resolves.toBe(bundle)
    expect(mockedGet).toHaveBeenCalledWith(
      'https://example.com/bundle',
      expect.objectContaining({
        httpAgent: 'filtering-agent',
        httpsAgent: 'filtering-agent',
        responseType: 'json',
      }),
    )
  })

  test('Should bound the size and the time of the download', async () => {
    mockedGet.mockResolvedValue({ data: {} })

    await fetchBundle('https://example.com/bundle')

    // A bundle costs several times its size in memory while it is parsed,
    // rewritten and stored, so an unbounded one can exhaust the pod.
    expect(MAX_BUNDLE_BYTES).toBe(100 * 1024 * 1024)
    expect(FETCH_BUNDLE_TIMEOUT_MS).toBe(60_000)
    expect(mockedGet).toHaveBeenCalledWith(
      'https://example.com/bundle',
      expect.objectContaining({
        maxContentLength: MAX_BUNDLE_BYTES,
        timeout: FETCH_BUNDLE_TIMEOUT_MS,
      }),
    )
  })
})
