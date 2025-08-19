import { GoogleAuth } from 'google-auth-library'
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios'
import { isNil } from 'lodash'

export class ApigeeApiClient {
  private readonly client: AxiosInstance
  private readonly auth: GoogleAuth
  private accessToken: string | null = null

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    this.client = axios.create({
      baseURL: 'https://apigee.googleapis.com/v1/',
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
      }),
    })

    this.client.interceptors.request.use(
      async (
        config: InternalAxiosRequestConfig,
      ): Promise<InternalAxiosRequestConfig> => {
        if (isNil(this.accessToken)) {
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
    try {
      const accessToken = await this.auth.getAccessToken()
      this.accessToken = accessToken ?? null
    } catch (error) {
      console.error('Failed to get access token:', error)
      throw new Error('Unable to get access token')
    }
  }

  async getAccessToken(): Promise<string> {
    if (isNil(this.accessToken)) {
      await this.refreshAccessToken()
    }
    if (isNil(this.accessToken)) {
      throw new Error('Failed to obtain access token')
    }
    return this.accessToken
  }

  async listApis(apigeeOrgId: string): Promise<{ proxies: string[] }> {
    const response = await this.client.get(`organizations/${apigeeOrgId}/apis`)
    return response.data
  }
}
