import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { SettingsValidationSchema } from '../../settings'
import { getAuthFromSettings, getAuthorizationHeader, type ZendeskAuth } from './auth'
import {
  type CreateTicketInput,
  type CreateTicketResponse,
  type GetTicketResponse,
  type UpdateTicketInput,
  zGetTicketResponse,
} from './types'

export class ZendeskAPIClient {
  private readonly client: AxiosInstance

  constructor(
    private readonly subdomain: string,
    private readonly auth: ZendeskAuth,
  ) {
    this.client = axios.create({
      baseURL: `https://${subdomain}.zendesk.com`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // The Authorization header is resolved per request so OAuth access
    // tokens can be fetched lazily and refreshed when they expire.
    this.client.interceptors.request.use(async (config) => {
      config.headers.Authorization = await getAuthorizationHeader(
        this.subdomain,
        this.auth,
      )
      return config
    })
  }

  public async createTicket(
    data: CreateTicketInput,
  ): Promise<CreateTicketResponse> {
    const response: AxiosResponse<CreateTicketResponse> =
      await this.client.post('/api/v2/tickets', { ticket: data })

    return response.data
  }

  /**
   * Fetches a single ticket and side-loads the related users (requester,
   * submitter, assignee) so the requester's name and email are available
   * without a second request.
   * https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-ticket
   */
  public async getTicket(ticketId: string): Promise<GetTicketResponse> {
    const response: AxiosResponse<unknown> = await this.client.get(
      `/api/v2/tickets/${encodeURIComponent(ticketId)}`,
      { params: { include: 'users' } },
    )

    return zGetTicketResponse.parse(response.data)
  }

  public async deleteTicket(ticketId: string): Promise<void> {
    await this.client.delete(`/api/v2/tickets/${ticketId}`)
  }

  public async updateTicket(
    ticketId: string,
    data: UpdateTicketInput,
  ): Promise<void> {
    await this.client.put(`/api/v2/tickets/${ticketId}`, { ticket: data })
  }
}

export const makeAPIClient = (
  payloadSettings: Record<string, string | undefined>,
): ZendeskAPIClient => {
  const settings = SettingsValidationSchema.parse(payloadSettings)

  return new ZendeskAPIClient(settings.subdomain, getAuthFromSettings(settings))
}
