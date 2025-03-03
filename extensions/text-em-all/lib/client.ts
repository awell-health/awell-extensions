import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import CryptoJS from 'crypto-js'
import OAuth from 'oauth-1.0a'

import { type Broadcast } from '../actions/types'

interface TextEmAllClientConfig {
  customerKey: string
  customerSecret: string
  token: string
  baseUrl: string
}

export class TextEmAllClient {
  private readonly client: AxiosInstance
  private readonly oauth: OAuth
  private readonly token: string
  private readonly customerSecret: string

  constructor(params: TextEmAllClientConfig) {
    const { customerKey, customerSecret, token, baseUrl } = params

    this.token = token
    this.customerSecret = customerSecret

    // Initialize OAuth
    this.oauth = new OAuth({
      consumer: {
        key: customerKey,
        secret: customerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64)
      },
    })

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Add request interceptor to add OAuth headers
    this.client.interceptors.request.use((config) => {
      const requestData = {
        url: `${baseUrl}${config.url ?? ''}`,
        method: config.method?.toUpperCase() ?? 'GET',
        data: config.data,
      }

      const authHeader = this.oauth.toHeader(
        this.oauth.authorize(requestData, {
          key: this.token,
          secret: this.customerSecret,
        }),
      )

      // Verify the header format matches Text-em-all's requirements
      if (!authHeader.Authorization.startsWith('OAuth ')) {
        throw new Error('Invalid OAuth header format')
      }

      config.headers.Authorization = authHeader.Authorization
      return config
    })
  }

  async createBroadcast(
    data: Record<string, any>,
  ): Promise<AxiosResponse<Broadcast>> {
    try {
      const resp = await this.client.post('/broadcasts', data)
      return resp.data
    } catch (error) {
      throw new Error(
        `Failed to create broadcast: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
