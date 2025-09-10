import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { type settings } from '../../settings'
import { SettingsValidationSchema } from '../../settings'
import { type CreateTicketInput, type CreateTicketResponse } from './types'

export class ZendeskAPIClient {
  private readonly client: AxiosInstance

  constructor({ subdomain, accessToken }: { subdomain: string; accessToken: string }) {
    this.client = axios.create({
      baseURL: `https://${subdomain}.zendesk.com`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
  }

  public async createTicket(data: CreateTicketInput): Promise<CreateTicketResponse> {
    const response: AxiosResponse<CreateTicketResponse> = await this.client.post(
      '/api/v2/tickets.json',
      { ticket: data }
    )
    return response.data
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): ZendeskAPIClient => {
  const { subdomain, access_token } = SettingsValidationSchema.parse(payloadSettings)

  return new ZendeskAPIClient({
    subdomain,
    accessToken: access_token,
  })
}
