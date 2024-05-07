import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { dockCacheService } from './cacheService'
import {
  type GetPatientInputType,
  type PatientResponse,
  type TaskResponse,
  type CreateTaskInput,
} from './schema'

export class DockDataWrapper extends DataWrapper {
  private readonly apiKey: string
  private readonly organizationId: string
  private readonly userId: string

  public constructor(
    token: string,
    baseUrl: string,
    dockOpts: {
      apiKey: string
      organizationId: string
      userId: string
    }
  ) {
    super(token, baseUrl)

    this.apiKey = dockOpts.apiKey
    this.organizationId = dockOpts.organizationId
    this.userId = dockOpts.userId
  }

  public async getPatient(
    input: GetPatientInputType
  ): Promise<PatientResponse> {
    const res = await this.Request<PatientResponse>({
      method: 'GET',
      url: `/api/v1/patient/${input.id}`,
      headers: {
        'x-api-key': this.apiKey,
        'x-user-id': this.userId,
        'x-organization-id': this.organizationId,
      },
    })

    return res
  }

  public async createTask(input: CreateTaskInput): Promise<TaskResponse> {
    const res = await this.Request<TaskResponse>({
      method: 'POST',
      url: `/api/v1/task`,
      headers: {
        'x-api-key': this.apiKey,
        'x-user-id': this.userId,
        'x-organization-id': this.organizationId,
      },
      data: JSON.stringify(input),
    })

    return res
  }
}

interface DockConstructorProps {
  apiKey: string
  organizationId: string
  userId: string
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class DockAPIClient extends APIClient<DockDataWrapper> {
  readonly apiKey: string
  readonly organizatinId: string
  readonly userId: string

  readonly ctor: DataWrapperCtor<DockDataWrapper> = (
    token: string,
    baseUrl: string
  ) =>
    new DockDataWrapper(token, baseUrl, {
      apiKey: this.apiKey,
      organizationId: this.organizatinId,
      userId: this.userId,
    })

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: DockConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService: dockCacheService,
      }),
    })

    this.apiKey = opts.apiKey
    this.organizatinId = opts.organizationId
    this.userId = opts.userId
  }

  public async getPatient(
    input: GetPatientInputType
  ): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(input))
  }

  public async createTask(input: CreateTaskInput): Promise<TaskResponse> {
    return await this.FetchData(async (dw) => await dw.createTask(input))
  }
}
