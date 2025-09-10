import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { SettingsValidationSchema } from '../../settings'
import { type CreateTicketInput, type CreateTicketResponse } from './types'

export class ZendeskDataWrapper extends DataWrapper {
  public async createTicket(data: CreateTicketInput): Promise<CreateTicketResponse> {
    return await this.Request<CreateTicketResponse>({
      method: 'POST',
      url: '/api/v2/tickets',
      data: { ticket: data },
    })
  }
}

interface ZendeskAPIClientConstructorProps {
  subdomain: string
  authUrl: string
  requestConfig: {
    client_id: string
    client_secret: string
    audience?: string
  }
}

export class ZendeskAPIClient extends APIClient<ZendeskDataWrapper> {
  readonly ctor: DataWrapperCtor<ZendeskDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new ZendeskDataWrapper(token, baseUrl)

  public constructor({
    subdomain,
    authUrl,
    requestConfig,
  }: ZendeskAPIClientConstructorProps) {
    super({
      baseUrl: `https://${subdomain}.zendesk.com`,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }

  public async createTicket(data: CreateTicketInput): Promise<CreateTicketResponse> {
    return await this.FetchData(async (dw) => await dw.createTicket(data))
  }
}

export const makeAPIClient = (
  payloadSettings: Record<string, string | undefined>
): ZendeskAPIClient => {
  const { subdomain, client_id, client_secret, auth_url, audience } = SettingsValidationSchema.parse(payloadSettings)

  return new ZendeskAPIClient({
    subdomain,
    authUrl: auth_url,
    requestConfig: {
      client_id,
      client_secret,
      ...(audience && { audience }),
    },
  })
}
