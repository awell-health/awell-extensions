import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import { type SendCallResponseType, type SendCallInputType } from './schema'

export class BlandApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    })
  }

  async sendCall(
    input: SendCallInputType
  ): Promise<AxiosResponse<SendCallResponseType>> {
    const response = await this.client.post<SendCallResponseType>(
      `/calls`,
      input
    )

    return response
  }
}
