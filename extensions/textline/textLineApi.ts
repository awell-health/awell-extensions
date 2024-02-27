import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, omitBy } from 'lodash'
import fetch from 'node-fetch'
import {
  type SendMessageResponse,
  GetMessagesSchema,
  type GetMessagesResponse,
} from './schema'

class TextLineApi {
  private readonly email: string
  private readonly password: string
  private readonly apiKey: string

  private readonly baseUrl = 'https://application.textline.com'

  constructor(email: string, password: string, apiKey: string) {
    this.email = email
    this.password = password
    this.apiKey = apiKey
  }

  private constructUrl(
    url: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const nonEmptyParams = omitBy(params, isNil)
    const queryParams = new URLSearchParams({
      todo: 'fixme',
      ...nonEmptyParams,
    })

    return `${this.baseUrl}${url}?${queryParams.toString()}`
  }

  async getMessages(
    phoneNumber?: string,
    page?: number,
    pageSize?: number
  ): Promise<GetMessagesResponse> {
    const accessToken = await this.authenticate()

    const url = this.constructUrl(`/api/conversations.json`, {
      phone_number: phoneNumber,
      page_size: pageSize,
      page,
    })
    const response = await fetchTyped(url, GetMessagesSchema, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': accessToken,
      },
    })
    return response
  }

  async authenticate(): Promise<string> {
    const url = this.constructUrl(`/auth/sign_in.json`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: this.email,
          password: this.password,
        },
        api_key: this.apiKey,
      }),
    })
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        isNil(result?.error)
          ? 'Unable to authenticate'
          : `Authentication failed with error: ${JSON.stringify(result.error)}`
      )
    }

    if (isNil(result?.access_token?.token)) {
      throw new Error(
        `Can't get access token from authentication response ${JSON.stringify(
          result
        )}`
      )
    }

    return result?.access_token?.token
  }

  async sendMessage(
    content: string,
    recipient: string
  ): Promise<SendMessageResponse> {
    const accessToken = await this.authenticate()

    const url = this.constructUrl(`/api/conversations.json`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': accessToken,
      },
      body: JSON.stringify({
        phone_number: recipient,
        comment: {
          body: content,
        },
      }),
    })
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        result?.message ?? 'Unknown error in TextLine API has occurred'
      )
    }

    return result
  }
}

export default TextLineApi
