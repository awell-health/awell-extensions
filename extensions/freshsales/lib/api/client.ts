import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import { type GetLeadResponseType } from './schema'

export class FreshsalesApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Token token=${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async getLead(leadId: string): Promise<AxiosResponse<GetLeadResponseType>> {
    const response = await this.client.get<GetLeadResponseType>(
      `/leads/${leadId}`,
    )

    return response
  }
}
