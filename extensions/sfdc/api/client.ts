import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { salesforceCacheService } from './cacheService'
import {
  type CreateRecordInputType,
  type CreateRecordResponseType,
} from './schema'

export class SalesforceDataWrapper extends DataWrapper {
  private readonly apiVersion: string

  public constructor(
    token: string,
    baseUrl: string,
    opts: {
      apiVersion: string
    }
  ) {
    super(token, baseUrl)

    this.apiVersion = opts.apiVersion
  }

  public async createRecord(
    input: CreateRecordInputType
  ): Promise<CreateRecordResponseType> {
    const res = await this.Request<CreateRecordResponseType>({
      method: 'POST',
      url: `/services/data/${this.apiVersion}/sobjects/${input.sObject}/`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(input.data),
    })

    return res
  }
}

interface SalesforceConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
  apiVersion: string
}

export class SalesforceRestAPIClient extends APIClient<SalesforceDataWrapper> {
  readonly apiVersion: string

  readonly ctor: DataWrapperCtor<SalesforceDataWrapper> = (
    token: string,
    baseUrl: string
  ) =>
    new SalesforceDataWrapper(token, baseUrl, { apiVersion: this.apiVersion })

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

    this.apiVersion = opts.apiVersion
  }

  public async createRecord(
    input: CreateRecordInputType
  ): Promise<CreateRecordResponseType> {
    return await this.FetchData(async (dw) => await dw.createRecord(input))
  }
}
