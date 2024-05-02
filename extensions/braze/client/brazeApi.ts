import { fetchTyped } from '@awell-health/extensions-core'
import { isNil, isEmpty, omitBy } from 'lodash'
import { type SendMessageResponse, SendMessageResponseSchema } from './schema'

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
    from: { email, name },
    body,
  }: {
    appId: string
    from: { email: string; name: string }
    body: string
  }): Promise<SendMessageResponse> {
    const url = this.constructUrl('/messages/send')
    const response = await fetchTyped(url, SendMessageResponseSchema, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: {
          email: { appId, from: `${name} <${email}>`, body },
        },
      }),
    })
    return { dispatch_id: response.dispatch_id }
  }

  async sendSms({
    appId,
    subscriptionGroupId,
    body,
  }: {
    appId: string
    subscriptionGroupId: string
    body: string
  }): Promise<SendMessageResponse> {
    const url = this.constructUrl('/messages/send')
    const response = await fetchTyped(url, SendMessageResponseSchema, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: {
          sms: { appId, subscription_group_id: subscriptionGroupId, body },
        },
      }),
    })
    return { dispatch_id: response.dispatch_id }
  }
}

export default BrazeApi
