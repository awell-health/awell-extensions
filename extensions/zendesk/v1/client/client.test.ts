import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { makeAPIClient } from './client'

/** A simulated failure of one API call: an HTTP status, or no response at all. */
type Failure = number | 'network'

const isTokenRequest = (config: AxiosRequestConfig): boolean =>
  String(config.baseURL).endsWith('/oauth/tokens')

/**
 * Stubs the adapter of every axios instance created during a test so no
 * request leaves the process, and records what would have been sent.
 * The token endpoint answers with an access token (`oauth-token-1`,
 * `oauth-token-2`, ... in the order they are issued); everything else with a
 * minimal ticket. `apiFailures` makes the first API calls (never the token
 * endpoint) fail, one entry per call.
 */
const captureRequests = (
  apiFailures: Failure[] = [],
): AxiosRequestConfig[] => {
  const sent: AxiosRequestConfig[] = []
  const pendingFailures = [...apiFailures]
  let tokensIssued = 0
  const realCreate = axios.create.bind(axios)

  jest.spyOn(axios, 'create').mockImplementation((config) => {
    const instance: AxiosInstance = realCreate(config)
    instance.defaults.adapter = async (requestConfig) => {
      sent.push(requestConfig)

      if (isTokenRequest(requestConfig)) {
        tokensIssued += 1
        return {
          data: {
            access_token: `oauth-token-${tokensIssued}`,
            token_type: 'bearer',
            expires_in: 1800,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: requestConfig,
        }
      }

      const failure = pendingFailures.shift()
      if (failure === 'network') {
        throw new AxiosError(
          'Network Error',
          AxiosError.ERR_NETWORK,
          requestConfig as InternalAxiosRequestConfig,
        )
      }
      if (failure !== undefined) {
        throw new AxiosError(
          `Request failed with status code ${failure}`,
          AxiosError.ERR_BAD_REQUEST,
          requestConfig as InternalAxiosRequestConfig,
          null,
          {
            data: {},
            status: failure,
            statusText: '',
            headers: {},
            config: requestConfig as InternalAxiosRequestConfig,
          },
        )
      }

      return {
        data: { ticket: { id: 1 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: requestConfig,
      }
    }
    return instance
  })

  return sent
}

const authHeader = (config: AxiosRequestConfig): string | undefined => {
  const value = (config.headers as any)?.Authorization
  return typeof value === 'string' ? value : undefined
}

const tokenRequests = (sent: AxiosRequestConfig[]): AxiosRequestConfig[] =>
  sent.filter(isTokenRequest)

const apiRequests = (sent: AxiosRequestConfig[]): AxiosRequestConfig[] =>
  sent.filter((config) => !isTokenRequest(config))

describe('Zendesk - API client authentication', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Legacy settings (email + API token) send the same Basic header as before', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company',
      user_email: 'agent@company.com',
      api_token: 'abc123',
    })

    await client.getTicket('1')

    expect(sent).toHaveLength(1)
    expect(sent[0].baseURL).toBe('https://company.zendesk.com')
    expect(sent[0].url).toBe('/api/v2/tickets/1')
    expect(authHeader(sent[0])).toBe(
      `Basic ${Buffer.from('agent@company.com/token:abc123').toString('base64')}`,
    )
  })

  test('Legacy settings still work when the OAuth settings are present but empty', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company',
      user_email: 'agent@company.com',
      api_token: 'abc123',
      oauth_client_id: '',
      oauth_client_secret: undefined,
    })

    await client.getTicket('1')

    expect(authHeader(sent[0])).toBe(
      `Basic ${Buffer.from('agent@company.com/token:abc123').toString('base64')}`,
    )
  })

  test('OAuth settings fetch a token with the client credentials grant and send it as Bearer', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: `awell-${Date.now()}`,
      oauth_client_secret: 'secret',
    })

    await client.getTicket('1')

    const [tokenRequest, apiRequest] = sent
    expect(tokenRequest.baseURL).toBe('https://company.zendesk.com/oauth/tokens')
    expect(tokenRequest.method).toBe('post')
    expect(String(tokenRequest.data)).toContain('grant_type=client_credentials')
    expect(String(tokenRequest.data)).toContain('client_secret=secret')
    expect(String(tokenRequest.data)).toContain('scope=read+write')
    expect(apiRequest.url).toBe('/api/v2/tickets/1')
    expect(authHeader(apiRequest)).toBe('Bearer oauth-token-1')
  })

  test('The OAuth token is cached between calls', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: `awell-cache-${Date.now()}`,
      oauth_client_secret: 'secret',
    })

    await client.getTicket('1')
    await client.getTicket('2')

    expect(tokenRequests(sent)).toHaveLength(1)
  })

  test('A new token is fetched once the cached one has expired', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: 'awell-expiry',
      oauth_client_secret: 'secret',
    })
    const issuedAt = Date.now()
    const now = jest.spyOn(Date, 'now').mockReturnValue(issuedAt)

    await client.getTicket('1')
    // Zendesk answers `expires_in: 1800` (30 minutes) in the stub.
    now.mockReturnValue(issuedAt + 1800 * 1000 - 1000)
    await client.getTicket('2')
    expect(tokenRequests(sent)).toHaveLength(1)

    now.mockReturnValue(issuedAt + 1800 * 1000 + 1000)
    await client.getTicket('3')

    expect(tokenRequests(sent)).toHaveLength(2)
    expect(authHeader(apiRequests(sent)[1])).toBe('Bearer oauth-token-1')
    expect(authHeader(apiRequests(sent)[2])).toBe('Bearer oauth-token-2')
  })

  test('A 401 discards the cached token and retries once with a fresh one', async () => {
    const sent = captureRequests([401])
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: 'awell-401',
      oauth_client_secret: 'secret',
    })

    await client.getTicket('1')

    expect(tokenRequests(sent)).toHaveLength(2)
    const calls = apiRequests(sent)
    expect(calls).toHaveLength(2)
    expect(authHeader(calls[0])).toBe('Bearer oauth-token-1')
    expect(authHeader(calls[1])).toBe('Bearer oauth-token-2')
  })

  test('A 401 that persists after the retry is surfaced to the caller', async () => {
    const sent = captureRequests([401, 401])
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: 'awell-401-persistent',
      oauth_client_secret: 'secret',
    })

    await expect(client.getTicket('1')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(apiRequests(sent)).toHaveLength(2)
  })

  test('A failure other than 401 is retried once without fetching a new token', async () => {
    const sent = captureRequests([500])
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: 'awell-500',
      oauth_client_secret: 'secret',
    })

    await client.getTicket('1')

    expect(tokenRequests(sent)).toHaveLength(1)
    expect(apiRequests(sent)).toHaveLength(2)
  })

  test('createTicket is retried after a lost response, so it can create a duplicate ticket', async () => {
    // Documents a known limitation (see the comment on `createTicket`): the
    // first attempt may have reached Zendesk, and the retry sends it again.
    const sent = captureRequests(['network'])
    const client = makeAPIClient({
      subdomain: 'company',
      user_email: 'agent@company.com',
      api_token: 'abc123',
    })

    await client.createTicket({ subject: 'Help', comment: { body: 'Please' } })

    const posts = apiRequests(sent).filter((c) => c.method === 'post')
    expect(posts).toHaveLength(2)
    expect(posts[1].url).toBe('/api/v2/tickets')
    expect(posts[1].headers).not.toHaveProperty('Idempotency-Key')
  })

  test('A pasted full host is normalised to the subdomain', async () => {
    const sent = captureRequests()
    const client = makeAPIClient({
      subdomain: 'company.zendesk.com',
      user_email: 'agent@company.com',
      api_token: 'abc123',
    })

    await client.getTicket('1')

    expect(sent[0].baseURL).toBe('https://company.zendesk.com')
  })
})
