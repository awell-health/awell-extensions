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
  type PatientSearchInputType,
  type PatientSearchResponseType,
  type AppointmentReadResponseType,
  type AppointmentReadInputType,
  type DocumentReferenceCreateInputType,
  type DocumentReferenceCreateResponseType,
  type EncounterSearchResponseType,
  type EncounterSearchInputType,
  type EncounterReadInputType,
  type EncounterReadResponseType,
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

  async searchPatient(
    data: PatientSearchInputType,
  ): Promise<AxiosResponse<PatientSearchResponseType>> {
    const MRN_SYSTEM_IDENTIFIER = 'urn:oid:2.16.840.1.113883.6.1000'

    const queryParams = new URLSearchParams()
    queryParams.set('identifier', `${MRN_SYSTEM_IDENTIFIER}|${data.MRN}`)
    const result = await this.RequestRaw<PatientSearchResponseType>({
      method: 'GET',
      url: `/Patient?${queryParams.toString()}`,
    })

    return result
  }

  public async getAppointment(
    id: AppointmentReadInputType,
  ): Promise<AxiosResponse<AppointmentReadResponseType>> {
    const result = await this.RequestRaw<AppointmentReadResponseType>({
      method: 'GET',
      url: `/Appointment/${id}`,
    })

    return result
  }

  public async createDocumentReference(
    data: DocumentReferenceCreateInputType,
  ): Promise<AxiosResponse<DocumentReferenceCreateResponseType>> {
    const result = await this.RequestRaw<DocumentReferenceCreateResponseType>({
      method: 'POST',
      url: `/DocumentReference`,
      data,
    })

    return result
  }

  public async getEncounter(
    id: EncounterReadInputType,
  ): Promise<AxiosResponse<EncounterReadResponseType>> {
    const result = await this.RequestRaw<EncounterReadResponseType>({
      method: 'GET',
      url: `/Encounter/${id}`,
    })

    return result
  }

  async searchEncounter(
    data: EncounterSearchInputType,
  ): Promise<AxiosResponse<EncounterSearchResponseType>> {
    const queryParams = new URLSearchParams()
    queryParams.set('patient', data.patientResourceId)
    const result = await this.RequestRaw<EncounterSearchResponseType>({
      method: 'GET',
      url: `/Encounter?${queryParams.toString()}`,
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

  public async searchPatient(
    data: PatientSearchInputType,
  ): Promise<AxiosResponse<PatientSearchResponseType>> {
    return await this.FetchData(async (dw) => await dw.searchPatient(data))
  }

  public async getAppointment(
    id: AppointmentReadInputType,
  ): Promise<AxiosResponse<AppointmentReadResponseType>> {
    return await this.FetchData(async (dw) => await dw.getAppointment(id))
  }

  public async createDocumentReference(
    data: DocumentReferenceCreateInputType,
  ): Promise<AxiosResponse<DocumentReferenceCreateResponseType>> {
    return await this.FetchData(
      async (dw) => await dw.createDocumentReference(data),
    )
  }

  public async searchEncounter(
    data: EncounterSearchInputType,
  ): Promise<AxiosResponse<EncounterSearchResponseType>> {
    return await this.FetchData(async (dw) => await dw.searchEncounter(data))
  }

  public async getEncounter(
    id: EncounterReadInputType,
  ): Promise<AxiosResponse<EncounterReadResponseType>> {
    return await this.FetchData(async (dw) => await dw.getEncounter(id))
  }
}
