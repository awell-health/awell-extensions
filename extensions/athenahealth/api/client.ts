import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '@awell-health/extensions-core'
import { type CreateAppointmentNoteInputType } from '../actions/createAppointmentNote/config/fields'
import { type CreatePatientInputType } from '../actions/createPatient/config/fields'
import { cacheService } from './cacheService'
import { type PatientSchemaType, type AppointmentSchemaType } from './schema'
import { type CreateAppointmentNoteResponseType } from './schema/appointment'
import { type CreatePatientResponseType } from './schema/patient'

export class AthenaDataWrapper extends DataWrapper {
  public async createPatient({
    practiceId,
    data,
  }: {
    practiceId: string
    data: Omit<CreatePatientInputType, 'practiceid'>
  }): Promise<CreatePatientResponseType> {
    const result = await this.Request<CreatePatientResponseType[]>({
      method: 'POST',
      url: `/v1/${practiceId}/patients`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
    })

    return result[0]
  }

  public async getPatient({
    practiceId,
    patientId,
  }: {
    practiceId: string
    patientId: string
  }): Promise<PatientSchemaType> {
    const result = await this.Request<PatientSchemaType[]>({
      method: 'GET',
      url: `/v1/${practiceId}/patients/${patientId}`,
    })

    return result[0]
  }

  public async getAppointment({
    practiceId,
    appointmentId,
  }: {
    practiceId: string
    appointmentId: string
  }): Promise<AppointmentSchemaType> {
    const result = await this.Request<AppointmentSchemaType[]>({
      method: 'GET',
      url: `/v1/${practiceId}/appointments/${appointmentId}`,
    })

    return result[0]
  }

  public async createAppointmentNote({
    practiceId,
    appointmentId,
    data,
  }: {
    practiceId: string
    appointmentId: string
    data: Omit<CreateAppointmentNoteInputType, 'practiceid' | 'appointmentid'>
  }): Promise<CreateAppointmentNoteResponseType> {
    const result = await this.Request<CreateAppointmentNoteResponseType>({
      method: 'POST',
      url: `/v1/${practiceId}/appointments/${appointmentId}/notes`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
    })

    return result
  }
}

interface AthenaClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class AthenaAPIClient extends APIClient<AthenaDataWrapper> {
  readonly ctor: DataWrapperCtor<AthenaDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new AthenaDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: AthenaClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService,
      }),
    })
  }

  public async createPatient({
    practiceId,
    data,
  }: {
    practiceId: string
    data: Omit<CreatePatientInputType, 'practiceid'>
  }): Promise<CreatePatientResponseType> {
    return await this.FetchData(
      async (dw) => await dw.createPatient({ practiceId, data })
    )
  }

  public async getPatient({
    practiceId,
    patientId,
  }: {
    practiceId: string
    patientId: string
  }): Promise<PatientSchemaType> {
    return await this.FetchData(
      async (dw) => await dw.getPatient({ patientId, practiceId })
    )
  }

  public async getAppointment({
    practiceId,
    appointmentId,
  }: {
    practiceId: string
    appointmentId: string
  }): Promise<AppointmentSchemaType> {
    return await this.FetchData(
      async (dw) => await dw.getAppointment({ appointmentId, practiceId })
    )
  }

  public async createAppointmentNote({
    practiceId,
    appointmentId,
    data,
  }: {
    practiceId: string
    appointmentId: string
    data: Omit<CreateAppointmentNoteInputType, 'practiceid' | 'appointmentid'>
  }): Promise<CreateAppointmentNoteResponseType> {
    return await this.FetchData(
      async (dw) =>
        await dw.createAppointmentNote({ appointmentId, practiceId, data })
    )
  }
}
