import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { SettingsValidationSchema } from '../../settings'
import { type CreateTicketInput, type CreateTicketResponse } from './types'

export class ZendeskAPIClient {
  private readonly client: AxiosInstance

  constructor(subdomain: string, userEmail: string, apiToken: string) {
    const credentials = `${userEmail}/token:${apiToken}`
    const encodedCredentials = Buffer.from(credentials).toString('base64')
    
    this.client = axios.create({
      baseURL: `https://${subdomain}.zendesk.com`,
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
    })
  }

  public async createTicket(data: CreateTicketInput): Promise<CreateTicketResponse> {
    const response: AxiosResponse<CreateTicketResponse> = await this.client.post(
      '/api/v2/tickets',
      { ticket: data }
    )
    
    return response.data
  }
}

export const makeAPIClient = (
  payloadSettings: Record<string, string | undefined>
): ZendeskAPIClient => {
  const { subdomain, user_email, api_token } = SettingsValidationSchema.parse(payloadSettings)

  return new ZendeskAPIClient(subdomain, user_email, api_token)
}
