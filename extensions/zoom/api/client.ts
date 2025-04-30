import axios, {
  type AxiosResponse,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios'
import { type SendSmsInputType, type SendSmsResponseType } from './schema'
import { endsWith, isNil } from 'lodash'

export class ZoomApiClient {
  private readonly client: AxiosInstance

  private readonly authUrl: string
  private readonly accountId: string
  private readonly clientId: string
  private readonly clientSecret: string

  private accessToken: string | null = null
  private tokenExpiry: number | null = null // Store token expiry time in UNIX timestamp

  constructor({
    baseUrl,
    authUrl,
    accountId,
    clientId,
    clientSecret,
  }: {
    baseUrl: string
    authUrl: string
    accountId: string
    clientId: string
    clientSecret: string
  }) {
    this.authUrl = authUrl
    this.accountId = accountId
    this.clientId = clientId
    this.clientSecret = clientSecret

    this.client = axios.create({
      baseURL: endsWith(baseUrl, '/') ? baseUrl : `${baseUrl}/`,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
      }),
    })

    this.client.interceptors.request.use(
      async (
        config: InternalAxiosRequestConfig,
      ): Promise<InternalAxiosRequestConfig> => {
        if (isNil(this.accessToken) || this.isTokenExpired()) {
          await this.refreshAccessToken()
        }

        if (!isNil(this.accessToken)) {
          config.headers = AxiosHeaders.from(config?.headers ?? {})
          config.headers.set('Authorization', `Bearer ${this.accessToken}`)
        }

        return config
      },
    )
  }

  private async refreshAccessToken(): Promise<void> {
    const authUrl = new URL(this.authUrl)
    /**
     * Zoom deviates from the OAuth2 spec in that the grant_type is account_credentials
     * and not client_credentials. Hence why we have this custom class instead of using OAuth helpers from
     * Extensions core.
     *
     * https://developers.zoom.us/docs/integrations/oauth/#request-an-access-token
     */
    authUrl.searchParams.set('grant_type', 'account_credentials')
    authUrl.searchParams.set('account_id', this.accountId)

    const authorizationToken = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64')

    try {
      const tokenResponse = await axios.post<{
        access_token: string
        token_type: string
        expires_in: number
        scope: string
        api_url: string
      }>(authUrl.toString(), {
        headers: {
          Authorization: `Basic ${authorizationToken}`,
        },
      })

      this.accessToken = tokenResponse.data.access_token
      this.tokenExpiry =
        Math.floor(Date.now() / 1000) + tokenResponse.data.expires_in // Current time + expiry
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      throw new Error('Unable to refresh access token')
    }
  }

  private isTokenExpired(): boolean {
    const now = Math.floor(Date.now() / 1000) // Current time in seconds
    return (
      isNil(this.tokenExpiry) || now >= this.tokenExpiry - 60 // Refresh 1 minute before expiry
    )
  }

  async sendSms(
    input: SendSmsInputType,
  ): Promise<AxiosResponse<SendSmsResponseType>> {
    const url = new URL(`contact_center/sms`, this.client.defaults.baseURL)

    const response = await this.client.post<SendSmsResponseType>(
      url.toString(),
      input,
    )

    return response
  }
}
