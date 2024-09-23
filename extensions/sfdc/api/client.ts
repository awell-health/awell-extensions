import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
  type OAuthGrantPasswordRequest,
  type OAuthGrantRequest,
  OAuthPassword,
} from '@awell-health/extensions-core'
import { salesforceCacheService } from './cacheService'
import {
  type UpdateRecordInputType,
  type UpdateRecordResponseType,
  type CreateRecordInputType,
  type CreateRecordResponseType,
  type GetRecordInputType,
  type GetRecordResponseType,
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
    return await this.Request<CreateRecordResponseType>({
      method: 'POST',
      url: `/services/data/${this.apiVersion}/sobjects/${input.sObject}/`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(input.data),
    })
  }

  public async updateRecord(input: UpdateRecordInputType): Promise<void> {
    await this.Request<UpdateRecordResponseType>({
      method: 'PATCH',
      url: `/services/data/${this.apiVersion}/sobjects/${input.sObject}/${input.sObjectId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(input.data),
    })
  }

  public async getRecordShape(sObject: string): Promise<unknown> {
    return await this.Request<unknown>({
      method: 'GET',
      url: `/services/data/${this.apiVersion}/sobjects/${sObject}/describe`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  public async getRecord(
    input: GetRecordInputType
  ): Promise<GetRecordResponseType> {
    return await this.Request<GetRecordResponseType>({
      method: 'GET',
      url: `/services/data/${this.apiVersion}/sobjects/${input.sObject}/${input.sObjectId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

interface SalesforceConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantRequest, 'grant_type'>
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
    const getAuth = (): OAuthPassword | OAuthClientCredentials => {
      if ('username' in requestConfig && 'password' in requestConfig) {
        return new OAuthPassword({
          auth_url: authUrl,
          request_config: requestConfig as Omit<
            OAuthGrantPasswordRequest,
            'grant_type'
          >,
          /**
           * Not sure whether caching is possible with the password grant
           */
          cacheService: salesforceCacheService,
        })
      }

      return new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig satisfies Omit<
          OAuthGrantClientCredentialsRequest,
          'grant_type'
        >,
        cacheService: salesforceCacheService,
      })
    }

    super({
      ...opts,
      auth: getAuth(),
    })

    this.apiVersion = opts.apiVersion
  }

  public async createRecord(
    input: CreateRecordInputType
  ): Promise<CreateRecordResponseType> {
    return await this.FetchData(async (dw) => await dw.createRecord(input))
  }

  public async updateRecord(input: UpdateRecordInputType): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.updateRecord(input)
    })
  }

  public async getRecordShape(sObject: string): Promise<unknown> {
    return await this.FetchData(async (dw) => await dw.getRecordShape(sObject))
  }

  public async getRecord(
    input: GetRecordInputType
  ): Promise<GetRecordResponseType> {
    return await this.FetchData(async (dw) => await dw.getRecord(input))
  }
}
