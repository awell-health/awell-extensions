import axios from 'axios'
import {
  clearTokenCache,
  getAuthFromSettings,
  getAuthorizationHeader,
} from './auth'

describe('Zendesk - client auth', () => {
  let postSpy: jest.SpyInstance

  beforeEach(() => {
    clearTokenCache()
    postSpy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: { access_token: 'access-1', token_type: 'bearer', expires_in: 1800 },
    })
  })

  afterEach(() => {
    postSpy.mockRestore()
  })

  test('Prefers OAuth client credentials when both are set', () => {
    expect(
      getAuthFromSettings({
        subdomain: 'acme',
        oauth_client_id: 'awell',
        oauth_client_secret: 'secret',
        user_email: 'a@b.co',
        api_token: 'token',
      }),
    ).toEqual({ type: 'oauth', clientId: 'awell', clientSecret: 'secret' })
  })

  test('Falls back to email + API token', () => {
    expect(
      getAuthFromSettings({
        subdomain: 'acme',
        oauth_client_id: undefined,
        oauth_client_secret: undefined,
        user_email: 'a@b.co',
        api_token: 'token',
      }),
    ).toEqual({ type: 'api_token', userEmail: 'a@b.co', apiToken: 'token' })
  })

  test('Builds a Basic header for API token auth without calling Zendesk', async () => {
    const header = await getAuthorizationHeader('acme', {
      type: 'api_token',
      userEmail: 'a@b.co',
      apiToken: 'token',
    })

    expect(header).toBe(
      `Basic ${Buffer.from('a@b.co/token:token').toString('base64')}`,
    )
    expect(postSpy).not.toHaveBeenCalled()
  })

  test('Exchanges client credentials for a bearer token and caches it', async () => {
    const auth = { type: 'oauth', clientId: 'awell', clientSecret: 'secret' } as const

    const first = await getAuthorizationHeader('acme', auth)
    const second = await getAuthorizationHeader('acme', auth)

    expect(first).toBe('Bearer access-1')
    expect(second).toBe('Bearer access-1')
    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).toHaveBeenCalledWith(
      'https://acme.zendesk.com/oauth/tokens',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'awell',
        client_secret: 'secret',
        scope: 'read write',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  })

  test('Requests a new token once the cached one has expired', async () => {
    const auth = { type: 'oauth', clientId: 'awell', clientSecret: 'secret' } as const
    postSpy.mockResolvedValueOnce({
      // 30 seconds is inside the 60 second safety margin, so it is treated as expired.
      data: { access_token: 'short-lived', expires_in: 30 },
    })

    await getAuthorizationHeader('acme', auth)
    const header = await getAuthorizationHeader('acme', auth)

    expect(header).toBe('Bearer access-1')
    expect(postSpy).toHaveBeenCalledTimes(2)
  })
})
