import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import {
  type PatientReadInputType,
  type PatientReadResponseType,
  type PatientCreateInputType,
  type PatientCreateResponseType,
} from './schema'
import { cernerCacheService } from './cacheService'
import { type AxiosResponse } from 'axios'

export class CernerR4DataWrapper extends DataWrapper {
  public async getPatient(
    id: PatientReadInputType,
  ): Promise<AxiosResponse<PatientReadResponseType>> {
    const result = await this.RequestRaw<PatientReadResponseType>({
      method: 'GET',
      url: `/Patient/${id}`,
    })

    return result
  }

  public async createPatient(
    patient: PatientCreateInputType,
  ): Promise<AxiosResponse<PatientCreateResponseType>> {
    const result = await this.RequestRaw<PatientCreateResponseType>({
      method: 'POST',
      url: `/Patient`,
      data: patient,
    })

    return result
  }
}

interface CernerR4ClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class CernerR4APIClient extends APIClient<CernerR4DataWrapper> {
  readonly ctor: DataWrapperCtor<CernerR4DataWrapper> = (
    token: string,
    baseUrl: string,
  ) => new CernerR4DataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: CernerR4ClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        useHeaderInAuthorization: true,
        cacheService: cernerCacheService,
      }),
    })
  }

  public async getPatient(
    id: PatientReadInputType,
  ): Promise<AxiosResponse<PatientReadResponseType>> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createPatient(
    patient: PatientCreateInputType,
  ): Promise<AxiosResponse<PatientCreateResponseType>> {
    return await this.FetchData(async (dw) => await dw.createPatient(patient))
  }
}
