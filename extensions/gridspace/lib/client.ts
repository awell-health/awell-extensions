import axios, { type AxiosInstance } from 'axios'

interface UploadContactToCampaignResponse {
  num_uploaded_contacts: number
}

export class GridspaceClient {
  private readonly client: AxiosInstance

  constructor({
    accountId,
    clientSecret,
  }: {
    accountId: string
    clientSecret: string
  }) {
    // base 64 encode the accountId and clientSecret in Basic Authentication format
    const token = Buffer.from(`${accountId}:${clientSecret}`).toString('base64')
    this.client = axios.create({
      baseURL: 'https://api.gridspace.com/v1',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  async callWithGrace(
    workflowId: string,
    data: Record<string, any>
  ): Promise<unknown> {
    const resp = await this.client.post(`/workflows/${workflowId}/run`, data)
    return resp.data
  }

  async uploadContactsToCampaign(
    campaignId: string,
    data: any
  ): Promise<UploadContactToCampaignResponse> {
    const response = await this.client.post(
      `/autodialer/${campaignId}/dialees`,
      data
    )
    return response.data
  }
}
