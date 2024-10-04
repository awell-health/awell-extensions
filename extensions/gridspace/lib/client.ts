import axios, { AxiosInstance } from 'axios'
export class GridspaceClient {
  private client: AxiosInstance
  constructor(basicAuthorization: string) {
    this.client = axios.create({
      baseURL: 'https://app.getinlet.ai',
      headers: {
        Authorization: `Basic ${basicAuthorization}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async callWithGrace(workflowId: string, data: Record<string, any>) {
    const resp = await this.client.post(`/v0/workflows/${workflowId}/run`, data)
    return resp.data
  }
}
