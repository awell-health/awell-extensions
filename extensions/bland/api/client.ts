import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type SendCallResponseType,
  type SendCallInputType,
  type GetCallDetailsInputType,
  type GetCallDetailsResponseType,
} from './schema'

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

  async getCallDetails(
    input: GetCallDetailsInputType
  ): Promise<AxiosResponse<GetCallDetailsResponseType>> {
    const response = await this.client.get<GetCallDetailsResponseType>(
      `/calls/${input.call_id}`
    )

    return response
  }
}
