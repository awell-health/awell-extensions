import { AuthError } from './errors'

export enum OAuthGrantType {
  PASSWORD = 'password',
}

export interface OAuthGrantPassword {
  client_id: string
  client_secret: string
  username: string
  password: string
}

export interface OAuthAccessTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
  scope: string
  refresh_token: string
}

export type OAuthOpts = OAuthGrantPassword & { auth_url: string }

export class OAuthPassword implements OAuthOpts {
  readonly client_id: string
  readonly client_secret: string
  readonly username: string
  readonly password: string
  readonly auth_url: string

  private get OAuthParams(): OAuthGrantPassword {
    return {
      client_id: this.client_id,
      client_secret: this.client_secret,
      username: this.username,
      password: this.password,
    }
  }

  public constructor(opts: OAuthOpts) {
    this.client_id = opts.client_id
    this.client_secret = opts.client_secret
    this.username = opts.username
    this.password = opts.password
    this.auth_url = opts.auth_url
  }

  public async Authenticate(): Promise<OAuthAccessTokenResponse> {
    const authVal = Buffer.from(
      `${this.client_id}:${this.client_secret}`
    ).toString('base64')
    const req = fetch(this.auth_url, {
      method: 'post',
      body: JSON.stringify(this.OAuthParams),
      headers: { authorization: `Basic ${authVal}` },
    })
    const resp = await req
    if (resp.status !== 200) {
      throw new AuthError(await resp.text(), resp.status)
    }
    const token: OAuthAccessTokenResponse = await resp.json()
    return token
  }
}
