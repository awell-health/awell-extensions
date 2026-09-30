import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
} from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../settings'
import {
  type AuthorizationScheme,
  getZendeskBaseUrl,
  makeZendeskAuth,
  type ZendeskAuth,
} from './auth'
import {
  type CreateTicketInput,
  type CreateTicketResponse,
  type GetTicketResponse,
  type UpdateTicketInput,
  zGetTicketResponse,
} from './types'

export class ZendeskDataWrapper extends DataWrapper {
  constructor(token: string, baseUrl: string, scheme: AuthorizationScheme) {
    super(token, baseUrl)
    // DataWrapper sets a top-level `Bearer` default; legacy API token auth
    // needs `Basic`, so overwrite that same default (not `headers.common`,
    // which the top-level value would take precedence over).
    this._client.defaults.headers.Authorization = `${scheme} ${token}`
  }

  public async createTicket(
    data: CreateTicketInput,
  ): Promise<CreateTicketResponse> {
    return await this.Request<CreateTicketResponse>({
      method: 'POST',
      url: '/api/v2/tickets',
      data: { ticket: data },
    })
  }

  /**
   * Fetches a single ticket and side-loads the related users (requester,
   * submitter, assignee) so the requester's name and email are available
   * without a second request.
   * https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-ticket
   */
  public async getTicket(ticketId: string): Promise<GetTicketResponse> {
    const data = await this.Request<unknown>({
      method: 'GET',
      url: `/api/v2/tickets/${encodeURIComponent(ticketId)}`,
      params: { include: 'users' },
    })

    return zGetTicketResponse.parse(data)
  }

  public async updateTicket(
    ticketId: string,
    data: UpdateTicketInput,
  ): Promise<void> {
    await this.Request<unknown>({
      method: 'PUT',
      url: `/api/v2/tickets/${encodeURIComponent(ticketId)}`,
      data: { ticket: data },
    })
  }

  public async deleteTicket(ticketId: string): Promise<void> {
    await this.Request<unknown>({
      method: 'DELETE',
      url: `/api/v2/tickets/${encodeURIComponent(ticketId)}`,
    })
  }
}

/**
 * Calls go through the extensions-core `APIClient`. Its `FetchData` retries a
 * failed call once after 250ms, whatever the error was; on a 401 it also
 * discards the cached token first, which is how an expired or revoked OAuth
 * token is replaced. The retry applies to `createTicket` as well.
 */
export class ZendeskAPIClient extends APIClient<ZendeskDataWrapper> {
  readonly ctor: DataWrapperCtor<ZendeskDataWrapper> = (token, baseUrl) =>
    new ZendeskDataWrapper(token, baseUrl, this.scheme)

  constructor(
    subdomain: string,
    private readonly scheme: AuthorizationScheme,
    auth: ZendeskAuth['auth'],
  ) {
    super({ auth, baseUrl: getZendeskBaseUrl(subdomain) })
  }

  /**
   * May create a duplicate ticket. Creating a ticket is not idempotent and
   * `FetchData` retries a failed attempt once (see the class comment), so a
   * request that Zendesk processed but whose response was lost (timeout,
   * connection reset, 5xx from an intermediary) is sent again and creates a
   * second ticket. Before this client moved to `APIClient` there was no retry.
   *
   * Zendesk supports an `Idempotency-Key` header on ticket creation that would
   * make the retry safe; this client does not send one yet.
   * https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
   */
  public async createTicket(
    data: CreateTicketInput,
  ): Promise<CreateTicketResponse> {
    return await this.FetchData(async (dw) => await dw.createTicket(data))
  }

  public async getTicket(ticketId: string): Promise<GetTicketResponse> {
    return await this.FetchData(async (dw) => await dw.getTicket(ticketId))
  }

  public async updateTicket(
    ticketId: string,
    data: UpdateTicketInput,
  ): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.updateTicket(ticketId, data)
    })
  }

  public async deleteTicket(ticketId: string): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.deleteTicket(ticketId)
    })
  }
}

export const makeAPIClient = (
  payloadSettings: Record<string, string | undefined>,
): ZendeskAPIClient => {
  const settings = SettingsValidationSchema.parse(payloadSettings)
  const { auth, scheme } = makeZendeskAuth(settings)

  return new ZendeskAPIClient(settings.subdomain, scheme, auth)
}
