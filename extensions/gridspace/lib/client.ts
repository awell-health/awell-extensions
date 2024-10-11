import axios, { type AxiosInstance } from 'axios'
export class GridspaceClient {
  private readonly client: AxiosInstance
  constructor(basicAuthorization: string) {
    this.client = axios.create({
      baseURL: 'https://app.getinlet.ai',
      headers: {
        Authorization: `Basic ${basicAuthorization}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async callWithGrace(
    workflowId: string,
    data: Record<string, any>
  ): Promise<unknown> {
    const resp = await this.client.post(`/v0/workflows/${workflowId}/run`, data)
    return resp.data
  }

  async uploadContactsToCampaign(campaignId: string, data: any): Promise<any> {
    const response = await this.client.post(
      `/autodialer/${campaignId}/dialees`,
      data
    )
    return response.data
  }
}
