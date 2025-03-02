import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import { isEmpty, isNil } from 'lodash'
import CryptoJS from 'crypto-js'

import { type Broadcast } from '../actions/types'

interface TextEmAllClientConfig {
  customerKey: string
  customerSecret: string
  token: string
  baseUrl: string
}

export class TextEmAllClient {
  private readonly client: AxiosInstance
  private readonly customerKey: string
  private readonly customerSecret: string
  private readonly token: string

  constructor(params: TextEmAllClientConfig) {
    const { customerKey, customerSecret, token, baseUrl } = params

    this.customerKey = customerKey
    this.customerSecret = customerSecret
    this.token = token

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Add request interceptor to add OAuth headers
    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = this.generateOAuthHeader(
        config.method?.toUpperCase() ?? 'GET',
        `${baseUrl}${config.url ?? ''}`,
        config.data,
      )
      return config
    })
  }

  private generateOAuthHeader(method: string, url: string, data?: any): string {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = CryptoJS.lib.WordArray.random(16).toString()

    const oauthParams = {
      oauth_consumer_key: this.customerKey,
      oauth_token: this.token,
      oauth_nonce: nonce,
      oauth_timestamp: timestamp,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
    }

    // Generate signature
    const signatureBaseString = this.createSignatureBaseString(
      method,
      url,
      oauthParams,
      data,
    )
    const signingKey = `${this.customerSecret}&${this.token}`
    const signature = CryptoJS.HmacSHA1(
      signatureBaseString,
      signingKey,
    ).toString(CryptoJS.enc.Base64)

    // Format OAuth header
    return (
      'OAuth ' +
      Object.entries({
        ...oauthParams,
        oauth_signature: signature,
      })
        .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
        .join(',')
    )
  }

  private createSignatureBaseString(
    method: string,
    url: string,
    oauthParams: Record<string, string>,
    data?: any,
  ): string {
    const params = new URLSearchParams()

    // Add OAuth params
    Object.entries(oauthParams).forEach(([key, value]) => {
      params.append(key, value)
    })

    // Add body params if POST/PUT
    if (
      !isNil(data) &&
      !isEmpty(data) &&
      (method === 'POST' || method === 'PUT')
    ) {
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value))
      })
    }

    // Sort parameters alphabetically (required by OAuth 1.0)
    const sortedParams = new URLSearchParams(
      [...params.entries()].sort(([a], [b]) => a.localeCompare(b)),
    )

    const baseString = [
      method,
      encodeURIComponent(url),
      encodeURIComponent(sortedParams.toString()),
    ].join('&')

    return baseString
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
