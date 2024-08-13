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

const API_VERSION = 'v61.0'

export class SalesforceDataWrapper extends DataWrapper {
  public constructor(token: string, baseUrl: string) {
    super(token, baseUrl)
  }

  public async createRecord(
    input: CreateRecordInputType
  ): Promise<CreateRecordResponseType> {
    const res = await this.Request<CreateRecordResponseType>({
      method: 'POST',
      url: `/services/data/${API_VERSION}/sobjects/${input.sObject}/`,
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
}

export class SalesforceRestAPIClient extends APIClient<SalesforceDataWrapper> {
  readonly ctor: DataWrapperCtor<SalesforceDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new SalesforceDataWrapper(token, baseUrl)

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
  }

  public async createRecord(
    input: CreateRecordInputType
  ): Promise<CreateRecordResponseType> {
    return await this.FetchData(async (dw) => await dw.createRecord(input))
  }
}
