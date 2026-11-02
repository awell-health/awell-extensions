import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type SendCallResponseType,
  type SendCallInputType,
  type GetCallDetailsInputType,
  type GetCallDetailsResponseType,
  type StopActiveCallInputType,
  type StopActiveCallResponseType,
  type SendSmsInputType,
  type SendSmsResponseType,
  type CreateSmsConversationInputType,
  type CreateSmsConversationResponseType,
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
    // Bland explains a rejection in the response body; axios's default message drops it.
    this.client.interceptors.response.use(undefined, async (error) => {
      if (axios.isAxiosError(error) && error.response !== undefined) {
        const { status, data } = error.response
        const body = typeof data === 'string' ? data : JSON.stringify(data)
        // Capped so a gateway HTML error page can't flood the activity feed.
        error.message = `Bland API ${error.config?.method?.toUpperCase() ?? ''} ${error.config?.url ?? ''} failed with status ${status}: ${String(body).slice(0, 500)}`
      }
      return await Promise.reject(error)
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

  async sendSms(
    input: SendSmsInputType
  ): Promise<AxiosResponse<SendSmsResponseType>> {
    const response = await this.client.post<SendSmsResponseType>(
      `/sms/send`,
      input
    )

    return response
  }

  async createSmsConversation(
    input: CreateSmsConversationInputType
  ): Promise<AxiosResponse<CreateSmsConversationResponseType>> {
    const response = await this.client.post<CreateSmsConversationResponseType>(
      `/sms/create`,
      input
    )

    return response
  }

  async stopActiveCall(
    input: StopActiveCallInputType
  ): Promise<AxiosResponse<StopActiveCallResponseType>> {
    const response = await this.client.post<StopActiveCallResponseType>(
      `/calls/${input.call_id}/stop`
    )

    return response
  }
}
