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
import {
  type PatientSchemaType,
  type AppointmentSchemaType,
  type CreateAppointmentNoteResponseType,
  type AddClinicalDocumentToPatientChartInputType,
  type AddClinicalDocumentToPatientChartResponseType,
  type CreatePatientResponseType,
} from './schema'

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

  public async addClinicalDocumentToPatientChart({
    practiceId,
    patientId,
    data,
  }: {
    practiceId: string
    patientId: string
    data: AddClinicalDocumentToPatientChartInputType
  }): Promise<AddClinicalDocumentToPatientChartResponseType> {
    const formData = new FormData()

    Object.entries(data).forEach((entry) => {
      const [key, value] = entry
      formData.append(key, String(value))
    })

    const result =
      await this.Request<AddClinicalDocumentToPatientChartResponseType>({
        method: 'POST',
        url: `/v1/${practiceId}/patients/${patientId}/documents/clinicaldocument`,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
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

  public async addClinicalDocumentToPatientChart({
    practiceId,
    patientId,
    data,
  }: {
    practiceId: string
    patientId: string
    data: AddClinicalDocumentToPatientChartInputType
  }): Promise<AddClinicalDocumentToPatientChartResponseType> {
    return await this.FetchData(
      async (dw) =>
        await dw.addClinicalDocumentToPatientChart({
          patientId,
          practiceId,
          data,
        })
    )
  }
}
