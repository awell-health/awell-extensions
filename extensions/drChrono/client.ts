import {
  APIClient,
  DataWrapper,
  OAuthPassword,
  type DataWrapperCtor,
  type OAuthGrantPasswordRequest,
} from '@awell-health/extensions-core'
import { type settings } from './settings'
import { type PatientInput, type PatientResponse } from './types/patient'
import { settingsSchema } from './validation/settings.zod'
import { drChronoCacheService } from './cache'

export class DrChronoDataWrapper extends DataWrapper {
  public async getPatient(id: number): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'GET',
      url: `/api/patients/${id}`,
    })
    const res = await req
    return res
  }

  public async createPatient(
    obj: Partial<PatientInput>
  ): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'POST',
      url: `/api/patients`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async updatePatient(
    id: number,
    obj: Partial<PatientInput>
  ): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'PUT',
      url: `/api/patients/${id}`,
      data: obj,
    })
    const res = await req
    return res
  }
}

interface DrChronoAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantPasswordRequest, 'grant_type'>
  baseUrl: string
}

export class DrChronoAPIClient extends APIClient<DrChronoDataWrapper> {
  readonly ctor: DataWrapperCtor<DrChronoDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new DrChronoDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: DrChronoAPIClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthPassword({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService: drChronoCacheService,
      }),
    })
  }

  public async getPatient(id: number): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createPatient(
    obj: Partial<PatientInput>
  ): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(
    id: number,
    obj: Partial<PatientInput>
  ): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.updatePatient(id, obj))
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): DrChronoAPIClient => {
  const { clientId, clientSecret } = settingsSchema.parse(payloadSettings)

  // ! TODO: needs a proper OAuth client
  return new DrChronoAPIClient({
    authUrl: 'https://drchrono.com/o/',
    requestConfig: {
      client_id: clientId,
      client_secret: clientSecret,
      password: '',
      username: '',
    },
    baseUrl: 'https:///drchrono.com',
  })
}
