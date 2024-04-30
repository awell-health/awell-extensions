import { isNil, isEmpty, omitBy } from 'lodash'
import fetch from 'node-fetch'
import { type SendMessageResponse } from './schema'

class BrazeApi {
  private readonly apiUrl: string
  private readonly apiKey: string
  private readonly headers: Record<string, string>

  constructor({ apiUrl, apiKey }: { apiUrl: string; apiKey: string }) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
    }
  }

  private constructUrl(
    url: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const nonEmptyParams = omitBy(params, isNil)

    if (isEmpty(nonEmptyParams)) {
      return `${this.apiUrl}${url}`
    }
    const stringParams: Record<string, string> = Object.fromEntries(
      Object.entries(nonEmptyParams).map(([key, value]) => [key, String(value)])
    )
    const queryParams = new URLSearchParams(stringParams)

    return `${this.apiUrl}${url}?${queryParams.toString()}`
  }

  async sendEmail({
    appId,
    from,
    body,
  }: {
    appId: string
    from: string
    body: string
  }): Promise<SendMessageResponse> {
    const url = this.constructUrl('/messages/send')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: {
          email: { appId, from, body },
        },
      }),
    })
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        !isNil(result?.errors)
          ? JSON.stringify(result?.errors)
          : 'Unknown error in Braze API has occurred'
      )
    }

    return result
  }
}

export default BrazeApi
