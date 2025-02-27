import axios, { type AxiosInstance } from 'axios'

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

  async sendMessageImmediately(data: Record<string, any>): Promise<unknown> {
    const resp = await this.client.post(`/messages/send`, data)
    return resp.data
  }

  async scheduleMessage(data: Record<string, any>): Promise<unknown> {
    const response = await this.client.post(`/messages/schedule/create`, data)
    return response.data
  }
}
