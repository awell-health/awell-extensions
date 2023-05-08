import MockAdapter from 'axios-mock-adapter'
import { RedisCache } from '../../../services/cache/redis/redis'
import { OAuth } from '../auth'
import qs from 'querystring'

jest.mock('../../../services/cache/redis/redis')

class TestOAuth extends OAuth {
  readonly cacheService = new RedisCache({})
}

describe('OAuth token cache flow', () => {
  let mock: MockAdapter,
    auth: TestOAuth,
    authenticateSpy: jest.SpyInstance,
    refreshAuthenticateSpy: jest.SpyInstance,
    configHash: string

  const auth_url = 'http://example.com'

  const request_config = {
    client_id: '123',
    client_secret: 'secret',
    grant_type: 'client_credentials',
  } as const

  const successResponse = {
    token_type: 'Bearer',
    expires_in: 100,
    scope: '*',
    access_token: 'access_token',
    refresh_token: 'refresh_token',
  }

  const responseHeaders = {
    'Content-Type': 'application/json',
  }

  beforeEach(() => {
    auth = new TestOAuth({ auth_url, request_config })
    mock = new MockAdapter(auth._client, { onNoMatch: 'throwException' })
    configHash = (auth as any).configHash

    authenticateSpy = jest.spyOn(auth as any, 'authenticate')
    refreshAuthenticateSpy = jest.spyOn(
      auth as any,
      'authenticateUsingRefreshToken'
    )
  })

  afterEach(() => {
    mock.reset()
  })

  describe('When there is a cached token', () => {
    beforeEach(async () => {
      await auth.cacheService.set(configHash, successResponse.access_token)
      await auth.cacheService.set(
        `${configHash}-refresh`,
        successResponse.refresh_token
      )
    })

    it('should use the cached token and not make a call to the authentication endpoint', async () => {
      const token = await auth.getAccessToken()
      expect(token).toEqual(successResponse.access_token)
      expect(authenticateSpy).not.toHaveBeenCalled()
      expect(refreshAuthenticateSpy).not.toHaveBeenCalled()
    })

    it('should properly invalidate the cached token', async () => {
      await auth.invalidateCachedToken()
      expect(await auth.cacheService.get(configHash)).toBeNull()
    })
  })

  describe('When there is no cached token', () => {
    beforeEach(async () => {
      await auth.cacheService.set(
        `${configHash}-refresh`,
        successResponse.refresh_token
      )
    })

    describe('and the refresh token is valid', () => {
      beforeEach(async () => {
        mock.onPost().reply(200, successResponse, responseHeaders)
      })

      it('should re-authenticate with the refresh token and return the new token', async () => {
        const token = await auth.getAccessToken()
        expect(refreshAuthenticateSpy).toHaveBeenCalled()
        expect(authenticateSpy).not.toHaveBeenCalled()
        expect(token).toEqual(successResponse.access_token)
      })

      it('should cache the response', async () => {
        await auth.getAccessToken()
        await auth.getAccessToken()
        expect(authenticateSpy).not.toHaveBeenCalled()
        // Requesting token two times should only cause one re-authentication
        expect(refreshAuthenticateSpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('and the refresh token is invalid', () => {
      beforeEach(async () => {
        mock.onPost().reply((config) => {
          const { grant_type } = qs.decode(config.data)

          if (grant_type === 'refresh_token') {
            return [401]
          }

          return [200, successResponse]
        })
      })

      it('should attempt re-authenticating with the refresh token', async () => {
        await auth.getAccessToken()
        expect(refreshAuthenticateSpy).toHaveBeenCalled()
      })

      it('should re-authenticate normally', async () => {
        await auth.getAccessToken()
        expect(authenticateSpy).toHaveBeenCalled()
      })

      it('should cache the response', async () => {
        await auth.getAccessToken()
        await auth.getAccessToken()
        expect(refreshAuthenticateSpy).toHaveBeenCalledTimes(1)
        expect(authenticateSpy).toHaveBeenCalledTimes(1)
      })

      it('should return the new token', async () => {
        const token = await auth.getAccessToken()
        expect(token).toEqual(successResponse.access_token)
      })
    })
  })
})
