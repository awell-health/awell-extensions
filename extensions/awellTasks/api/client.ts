import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import {
  type GetCareflowCommentsInputType,
  type GetCareflowCommentsResponseType,
} from './schema'

export class TasksApiClient {
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

  async getCareflowComments(
    input: GetCareflowCommentsInputType,
  ): Promise<AxiosResponse<GetCareflowCommentsResponseType>> {
    const queryParams = new URLSearchParams()
    queryParams.set('careflow_id', input.careflowId)

    if (input?.limit !== undefined) {
      queryParams.set('limit', input.limit.toString())
    }

    if (input?.offset !== undefined) {
      queryParams.set('offset', input.offset.toString())
    }

    const response = await this.client.get<GetCareflowCommentsResponseType>(
      `/comments?${queryParams.toString()}`,
    )

    return response
  }
}
