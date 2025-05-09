import axios, { type AxiosInstance } from 'axios'

interface SendMessageImmediatelyResponse {
  dispatch_id: string
}

interface ScheduleMessageResponse {
  dispatch_id: string
  schedule_id: string
  message: string // success and maybe something else
}

export class BrazeClient {
  private readonly client: AxiosInstance

  constructor({ apiKey, baseUrl }: { apiKey: string; baseUrl: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  async sendMessageImmediately(
    data: Record<string, any>,
  ): Promise<SendMessageImmediatelyResponse> {
    const resp = await this.client.post(`/messages/send`, data)
    return resp.data
  }

  async scheduleMessage(
    data: Record<string, any>,
  ): Promise<ScheduleMessageResponse> {
    const response = await this.client.post(`/messages/schedule/create`, data)
    return response.data
  }

  async sendEmailWithAttributes(
    data: Record<string, any>,
  ): Promise<SendMessageImmediatelyResponse> {
    const response = await this.client.post(`/campaigns/trigger/send`, data)
    return response.data
  }
}
