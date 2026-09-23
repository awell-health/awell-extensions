import axios from 'axios'
import { type AxiosRequestConfig } from 'axios'
import { ZendeskAPIClient, makeAPIClient } from './client'
import { clearTokenCache } from './auth'

/**
 * Replaces the axios adapter of the client's private instance so requests
 * never leave the process, and captures the config that would have been sent.
 */
const captureRequests = (client: ZendeskAPIClient): AxiosRequestConfig[] => {
  const sent: AxiosRequestConfig[] = []
  const instance = (client as any).client
  instance.defaults.adapter = async (config: AxiosRequestConfig) => {
    sent.push(config)
    return {
      data: { ticket: { id: 1 } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }
  return sent
}

describe('Zendesk - API client authentication', () => {
  beforeEach(() => {
    clearTokenCache()
  })

  test('Legacy settings (email + API token) send the same Basic header as before', async () => {
    const client = makeAPIClient({
      subdomain: 'company',
      user_email: 'agent@company.com',
      api_token: 'abc123',
    })
    const sent = captureRequests(client)

    await client.getTicket('1')

    expect(sent).toHaveLength(1)
    expect(sent[0].baseURL).toBe('https://company.zendesk.com')
    expect(sent[0].url).toBe('/api/v2/tickets/1')
    expect(sent[0].headers?.Authorization).toBe(
      `Basic ${Buffer.from('agent@company.com/token:abc123').toString('base64')}`,
    )
  })

  test('Legacy settings still work when the OAuth settings are present but empty', async () => {
    const client = makeAPIClient({
      subdomain: 'company',
      user_email: 'agent@company.com',
      api_token: 'abc123',
      oauth_client_id: '',
      oauth_client_secret: undefined,
    })
    const sent = captureRequests(client)

    await client.getTicket('1')

    expect(sent[0].headers?.Authorization).toBe(
      `Basic ${Buffer.from('agent@company.com/token:abc123').toString('base64')}`,
    )
  })

  test('OAuth settings send a Bearer token obtained via client credentials', async () => {
    const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: { access_token: 'oauth-token', expires_in: 1800 },
    })
    const client = makeAPIClient({
      subdomain: 'company',
      oauth_client_id: 'awell',
      oauth_client_secret: 'secret',
    })
    const sent = captureRequests(client)

    await client.getTicket('1')

    expect(postSpy).toHaveBeenCalledWith(
      'https://company.zendesk.com/oauth/tokens',
      expect.any(String),
      expect.anything(),
    )
    expect(sent[0].headers?.Authorization).toBe('Bearer oauth-token')
    postSpy.mockRestore()
  })

  test('A pasted full host is normalised to the subdomain', async () => {
    const client = makeAPIClient({
      subdomain: 'company.zendesk.com',
      user_email: 'agent@company.com',
      api_token: 'abc123',
    })
    const sent = captureRequests(client)

    await client.getTicket('1')

    expect(sent[0].baseURL).toBe('https://company.zendesk.com')
  })
})
