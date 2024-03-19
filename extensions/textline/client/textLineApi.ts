import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, omitBy } from 'lodash'
import fetch, { type Response } from 'node-fetch'
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

  private async validateResponse<T = unknown>(response: Response): Promise<T> {
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        !isNil(result?.errors)
          ? JSON.stringify({ errors: result?.errors, code: response.status })
          : !isNil(result?.message)
          ? JSON.stringify({ message: result?.message, code: response.status })
          : JSON.stringify({
              message: 'Unknown error in TextLine API has occurred',
              status_code: response.status,
            })
      )
    }

    return result
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
    afterMessageId?: string,
    departmentId?: string,

    page?: number,
    pageSize?: number
  ): Promise<GetMessagesResponse> {
    const url = this.constructUrl(`/api/conversations.json`, {
      phone_number: phoneNumber,
      after_uuid: afterMessageId,
      page_size: pageSize,
      page,
      group_uuid: departmentId,
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
    recipient: string,
    departmentId?: string
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
        group_uuid: departmentId,
      }),
    })
    return await this.validateResponse(response)
  }

  async setContactConsent(
    consentStatus: boolean,
    recipient: string
  ): Promise<void> {
    const url = this.constructUrl(`/api/customers/set_consent.json`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-TGP-ACCESS-TOKEN': this.accessToken,
      },
      body: JSON.stringify({
        phone_number: recipient,
        consent: consentStatus ? 1 : 0,
      }),
    })
    // returns void, so we check for errors here
    await this.validateResponse(response)
  }
}

export default TextLineApi
