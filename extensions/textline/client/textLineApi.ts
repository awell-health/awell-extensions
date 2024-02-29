import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, omitBy } from 'lodash'
import fetch from 'node-fetch'
import {
  type SendMessageResponse,
  GetMessagesSchema,
  type GetMessagesResponse,
} from './schema'

class TextLineApi {
  private readonly accessToken: string

  private readonly baseUrl = 'https://application.textline.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private constructUrl(
    url: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const nonEmptyParams = omitBy(params, isNil)

    const stringParams: Record<string, string> = Object.fromEntries(
      Object.entries(nonEmptyParams).map(([key, value]) => [key, String(value)])
    )
    const queryParams = new URLSearchParams(stringParams)

    return `${this.baseUrl}${url}?${queryParams.toString()}`
  }

  async getMessages(
    phoneNumber?: string,
    page?: number,
    pageSize?: number
  ): Promise<GetMessagesResponse> {
    const url = this.constructUrl(`/api/conversations.json`, {
      phone_number: phoneNumber,
      page_size: pageSize,
      page,
    })
    const response = await fetchTyped(url, GetMessagesSchema, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': this.accessToken,
      },
    })
    return response
  }

  async sendMessage(
    content: string,
    recipient: string
  ): Promise<SendMessageResponse> {
    const url = this.constructUrl(`/api/conversations.json`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': this.accessToken,
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
