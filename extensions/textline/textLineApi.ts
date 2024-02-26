import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, omitBy } from 'lodash'
import fetch from 'node-fetch'
import {
  SendMessageResponse,
  GetMessagesSchema,
  GetMessagesResponse,
} from './schema'

class TextLineApi {
  private readonly accessToken: string
  private readonly baseUrl = 'https://application.textline.com/api'

  constructor(accessToken: string) {
    this.accessToken = accessToken
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
    phone_number?: string,
    page?: number,
    page_size?: number
  ): Promise<GetMessagesResponse> {
    const url = this.constructUrl(`conversations.json`, {
      phone_number,
      page_size,
      page,
    })
    const response = await fetchTyped(url, GetMessagesSchema)
    return response
  }

  async sendMessage(value: {
    content: string
    recipient: string
  }): Promise<SendMessageResponse> {
    const url = this.constructUrl(`/bookings`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': this.accessToken,
      },
      body: JSON.stringify({
        phone_number: value.recipient,
        comment: {
          body: value.content,
        },
      }),
    })
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        result?.message ?? 'Unknown error in Cal.com API has occurred'
      )
    }

    return result
  }
}

export default TextLineApi
