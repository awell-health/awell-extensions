import * as Axios from 'axios'
import { URLSearchParams } from 'url'
import { type CacheService, NoCache } from './cache/cache'
import { createHash } from 'node:crypto'

interface OAuthGrantRequestBase {
  client_id: string
  client_secret: string
  scope?: string
}

export interface OAuthGrantPasswordRequest extends OAuthGrantRequestBase {
  username: string
  password: string
  grant_type: 'password'
}

export interface OAuthGrantClientCredentialsRequest
  extends OAuthGrantRequestBase {
  audience?: string
  grant_type: 'client_credentials'
}

export type OAuthGrantRequest =
  | OAuthGrantPasswordRequest
  | OAuthGrantClientCredentialsRequest

export interface OAuthRefreshTokenRequest {
  client_id: string
  client_secret: string
  refresh_token: string
  grant_type: 'refresh_token'
}

export interface OAuthAccessTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
  scope: string
  refresh_token: string
}

export interface OAuthOpts {
  request_config: OAuthGrantRequest
  auth_url: string
}

/**
 * In the future, this class should be responsible for not only getting the access token,
 * but also saving the access token _somehwere_ and then refreshing it when it's expired.
 */
export class OAuth {
  readonly grantRequest: OAuthGrantRequest
  readonly refreshRequest: (refreshTok: string) => OAuthRefreshTokenRequest
  readonly cacheService: CacheService<string> = new NoCache()
  readonly _client: Axios.AxiosInstance
  private readonly configHash: string

  public constructor({ auth_url, request_config }: OAuthOpts) {
    this.grantRequest = { ...request_config }

    // A hash used to identify the client in cache.
    this.configHash = createHash('sha256')
      .update(JSON.stringify(request_config))
      .digest('hex')

    this.refreshRequest = (tok) => {
      return {
        client_id: request_config.client_id,
        client_secret: request_config.client_secret,
        grant_type: 'refresh_token',
        refresh_token: tok,
      }
    }

    // In testing, we don't currently need the basic auth for elation,
    // even though they include it in their docs. keeping here, regardless.
    const authVal = Buffer.from(
      `${request_config.client_id}:${request_config.client_secret}`
    ).toString('base64')
    const headers = {
      authorization: `Basic ${authVal}`,
      'content-type': 'application/x-www-form-urlencoded',
    }
    this._client = Axios.default.create({
      baseURL: auth_url,
      headers,
      validateStatus: (status) => {
        return status >= 200 && status < 300
      },
    })
  }

  /**
   * Invalidates the cached access token. Next time `authenticate()` is called, this will result in cache miss
   * and re-authentication.
   */
  public async invalidateCachedToken(): Promise<void> {
    await this.cacheService.unset(this.configHash)
  }

  private async getCachedToken(): Promise<string | null> {
    return await this.cacheService.get(this.configHash)
  }

  private async getCachedRefreshToken(): Promise<string | null> {
    return await this.cacheService.get(`${this.configHash}-refresh`)
  }

  /**
   * Stores both the access token, and the refresh token if one is provided.
   *
   * @param response Success response from the authentication endpoint
   * @private
   */
  private async storeToken(response: OAuthAccessTokenResponse): Promise<void> {
    await this.cacheService.set(
      this.configHash,
      response.access_token,
      Date.now() + response.expires_in * 1000
    )

    if (response.refresh_token !== '') {
      await this.cacheService.set(
        `${this.configHash}-refresh`,
        response.refresh_token
      )
    }
  }

  /**
   * Responsible for hitting the auth server and getting a fresh access token.
   * @private
   */
  private async authenticate(): Promise<OAuthAccessTokenResponse> {
    const req = this._client.post<OAuthAccessTokenResponse>(
      '/',
      new URLSearchParams(Object.entries(this.grantRequest)).toString()
    )
    try {
      const res = await req
      return res.data
    } catch (e) {
      const err = e as Axios.AxiosError
      if (err.response != null) {
        console.log(err.response.data)
        console.log(err.response.status)
      } else if (err.request != null) {
        console.error('Axios error: No response was received')
      } else {
        console.error('Some error in setting up the auth request')
      }
      throw err
    }
  }

  /**
   * Retrieves the cached token, or re-authenticates in case of cache miss.
   * @returns the access token string
   */
  public async getAccessToken(): Promise<string> {
    const cachedToken = await this.getCachedToken()
    if (cachedToken !== null) {
      return cachedToken
    }

    const refreshToken = await this.getCachedRefreshToken()
    if (refreshToken !== null) {
      try {
        const token = await this.authenticateUsingRefreshToken(refreshToken)
        await this.storeToken(token)
        return token.access_token
      } catch (e) {
        const err = e as Axios.AxiosError
        // 401 means the refresh token is invalid, in this case we silence the error and fall back to normal authentication
        if (err.response == null || err.response.status !== 401) {
          console.error('Error while using refresh token')
          throw err
        }
      }
    }

    const token = await this.authenticate()
    await this.storeToken(token)
    return token.access_token
  }

  /**
   * Responsible for hitting the authentication endpoint with the refresh token
   * @param tok the refresh token
   * @returns a new token object.
   */
  private async authenticateUsingRefreshToken(
    tok: string
  ): Promise<OAuthAccessTokenResponse> {
    const req = this._client.post<OAuthAccessTokenResponse>(
      '/',
      new URLSearchParams(Object.entries(this.refreshRequest(tok))).toString()
    )
    const res = await req
    return res.data
  }
}

export interface OAuthOptsWithoutGrantType<T> {
  auth_url: string
  request_config: Omit<T, 'grant_type'>
}

export class OAuthClientCredentials extends OAuth {
  public constructor({
    auth_url,
    request_config,
  }: OAuthOptsWithoutGrantType<OAuthGrantClientCredentialsRequest>) {
    super({
      auth_url,
      request_config: { ...request_config, grant_type: 'client_credentials' },
    })
  }
}

export class OAuthPassword extends OAuth {
  public constructor({
    auth_url,
    request_config,
  }: OAuthOptsWithoutGrantType<OAuthGrantPasswordRequest>) {
    super({
      auth_url,
      request_config: { ...request_config, grant_type: 'password' },
    })
  }
}
