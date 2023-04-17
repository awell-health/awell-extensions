import * as Axios from 'axios'
import { URLSearchParams } from 'url'

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
 *
 * TODO: save the token object somewhere retrievable, and use refresh token to refresh it
 */
export class OAuth {
  readonly grantRequest: OAuthGrantRequest
  readonly refreshRequest: (refreshTok: string) => OAuthRefreshTokenRequest
  readonly _client: Axios.AxiosInstance

  public constructor({ auth_url, request_config }: OAuthOpts) {
    this.grantRequest = { ...request_config }

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
   * Responsible for hitting the auth server and getting a fresh access token.
   * @returns a token object
   */
  public async authenticate(): Promise<OAuthAccessTokenResponse> {
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
   * We aren't currently using the refresh token but including here for the future.
   * @param tok the refresh token
   * @returns a new token object.
   */
  public async refreshToken(tok: string): Promise<OAuthAccessTokenResponse> {
    const req = this._client.post<OAuthAccessTokenResponse>('/', {
      body: new URLSearchParams(Object.entries(this.refreshRequest(tok))),
    })
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
