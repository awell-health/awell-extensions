import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { makeAPIClient } from './client'

/**
 * Stubs the adapter of every axios instance created during a test so no
 * request leaves the process, and records what would have been sent.
 * The token endpoint answers with an access token; everything else with a
 * minimal ticket.
 */
const captureRequests = (): AxiosRequestConfig[] => {
  const sent: AxiosRequestConfig[] = []
  const realCreate = axios.create.bind(axios)

  jest.spyOn(axios, 'create').mockImplementation((config) => {
    const instance: AxiosInstance = realCreate(config)
    instance.defaults.adapter = async (requestConfig) => {
      sent.push(requestConfig)
      const isTokenRequest = String(requestConfig.baseURL).endsWith(
        '/oauth/tokens',
      )
      return {
        data: isTokenRequest
          ? { access_token: 'oauth-token', token_type: 'bearer', expires_in: 1800 }
          : { ticket: { id: 1 } },
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
    expect(authHeader(apiRequest)).toBe('Bearer oauth-token')
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

    const tokenRequests = sent.filter((c) =>
      String(c.baseURL).endsWith('/oauth/tokens'),
    )
    expect(tokenRequests).toHaveLength(1)
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
