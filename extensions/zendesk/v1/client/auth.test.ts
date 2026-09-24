import { OAuthClientCredentials } from '@awell-health/extensions-core'
import {
  ZendeskApiTokenAuth,
  ZendeskOAuthClientCredentials,
  makeZendeskAuth,
} from './auth'

describe('Zendesk - client auth', () => {
  test('Prefers OAuth client credentials when both are set', () => {
    const { auth, scheme } = makeZendeskAuth({
      subdomain: 'acme',
      oauth_client_id: 'awell',
      oauth_client_secret: 'secret',
      user_email: 'a@b.co',
      api_token: 'token',
    })

    expect(scheme).toBe('Bearer')
    expect(auth).toBeInstanceOf(ZendeskOAuthClientCredentials)
    expect(auth).toBeInstanceOf(OAuthClientCredentials)
    expect(auth._client.defaults.baseURL).toBe(
      'https://acme.zendesk.com/oauth/tokens',
    )
    expect(auth.grantRequest).toEqual({
      grant_type: 'client_credentials',
      client_id: 'awell',
      client_secret: 'secret',
      scope: 'read write',
    })
  })

  test('Falls back to email + API token', async () => {
    const { auth, scheme } = makeZendeskAuth({
      subdomain: 'acme',
      oauth_client_id: undefined,
      oauth_client_secret: undefined,
      user_email: 'a@b.co',
      api_token: 'token',
    })

    expect(scheme).toBe('Basic')
    expect(auth).toBeInstanceOf(ZendeskApiTokenAuth)
    await expect(auth.getAccessToken()).resolves.toBe(
      Buffer.from('a@b.co/token:token').toString('base64'),
    )
  })

  test('Throws when neither credential pair is present', () => {
    expect(() =>
      makeZendeskAuth({
        subdomain: 'acme',
        oauth_client_id: undefined,
        oauth_client_secret: undefined,
        user_email: undefined,
        api_token: undefined,
      }),
    ).toThrow('usable credentials')
  })
})
