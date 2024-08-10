import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { salesforceCacheService } from './cacheService'
import {
  type CreateContactInputType,
  type CreateContactResponseType,
} from './schema'

export class SalesforceDataWrapper extends DataWrapper {
  private readonly subdomain: string

  public constructor(
    token: string,
    baseUrl: string,
    opts: {
      subdomain: string
    }
  ) {
    super(token, baseUrl)

    this.subdomain = opts.subdomain
  }

  public async createContact(
    input: CreateContactInputType
  ): Promise<CreateContactResponseType> {
    const res = await this.Request<CreateContactResponseType>({
      method: 'POST',
      url: '/contacts/v1/contacts',
      data: JSON.stringify(input),
    })

    return res
  }
}

interface SalesforceConstructorProps {
  subdomain: string
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class SalesforceAPIClient extends APIClient<SalesforceDataWrapper> {
  readonly subdomain: string

  readonly ctor: DataWrapperCtor<SalesforceDataWrapper> = (
    token: string,
    baseUrl: string
  ) =>
    new SalesforceDataWrapper(token, baseUrl, {
      subdomain: this.subdomain,
    })

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: SalesforceConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService: salesforceCacheService,
      }),
    })

    this.subdomain = opts.subdomain
  }

  public async createContact(
    input: CreateContactInputType
  ): Promise<CreateContactResponseType> {
    return await this.FetchData(async (dw) => await dw.createContact(input))
  }
}
