import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import {
  type AppointmentWithId,
  settingsSchema,
  type Appointment,
  type Task,
  type TaskWithId,
  type Patient,
  type PatientWithId,
  type CreatingQuestionnaireResponses,
  type QuestionnaireResponse,
} from '../validation'
import type {
  AppointmentWithIdResponse,
  CanvasAPIClientConstrutorProps,
  Id,
  TaskWithIdResponse,
  EntryWrapperResponse,
  PatientWithIdResponse,
} from './type'
import { extractIdFromLocationHeader } from './utils'

export class CanvasDataWrapper extends DataWrapper {
  public async createAppointment(data: Appointment): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Appointment`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async getAppointment(id: string): Promise<AppointmentWithIdResponse> {
    return await this.Request<AppointmentWithIdResponse>({
      method: 'GET',
      url: `/Appointment/${id}`,
    })
  }

  public async updateAppointment(data: AppointmentWithId): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Appointment/${data.id}`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async createTask(data: Task): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Task`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async updateTask(data: TaskWithId): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Task/${data.id}`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async getTask(id: string): Promise<TaskWithId> {
    const response = await this.Request<
      EntryWrapperResponse<TaskWithIdResponse>
    >({
      method: 'GET',
      url: `/Task?_id=${id}`,
    })
    if (response.total === 0) throw new Error('Task not found')
    return response.entry[0].resource
  }

  public async createPatient(data: Patient): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Patient`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async updatePatient(data: PatientWithId): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Patient/${data.id}`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async getPatient(id: string): Promise<PatientWithIdResponse> {
    return await this.Request<PatientWithIdResponse>({
      method: 'GET',
      url: `/Patient/${id}`,
    })
  }

  public async createQuestionnaireResponses(
    data: CreatingQuestionnaireResponses
  ): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/QuestionnaireResponse`,
      data,
    })

    return extractIdFromLocationHeader(response)
  }

  public async getQuestionnaireResponse(
    id: string
  ): Promise<QuestionnaireResponse> {
    return await this.Request<QuestionnaireResponse>({
      method: 'GET',
      url: `/QuestionnaireResponse/${id}`,
    })
  }
}

export class CanvasAPIClient extends APIClient<CanvasDataWrapper> {
  readonly ctor: DataWrapperCtor<CanvasDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new CanvasDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: CanvasAPIClientConstrutorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }

  public async createAppointment(obj: Appointment): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createAppointment(obj))
  }

  public async getAppointment(id: string): Promise<AppointmentWithIdResponse> {
    return await this.FetchData(async (dw) => await dw.getAppointment(id))
  }

  public async updateAppointment(obj: AppointmentWithId): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updateAppointment(obj))
  }

  public async createTask(obj: Task): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createTask(obj))
  }

  public async getTask(id: string): Promise<TaskWithIdResponse> {
    return await this.FetchData(async (dw) => await dw.getTask(id))
  }

  public async updateTask(obj: TaskWithId): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updateTask(obj))
  }

  public async createPatient(obj: Patient): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(obj: PatientWithId): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updatePatient(obj))
  }

  public async getPatient(id: string): Promise<PatientWithIdResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createQuestionnaireResponses(
    obj: CreatingQuestionnaireResponses
  ): Promise<Id> {
    return await this.FetchData(
      async (dw) => await dw.createQuestionnaireResponses(obj)
    )
  }

  public async getQuestionnaireResponse(
    id: string
  ): Promise<QuestionnaireResponse> {
    return await this.FetchData(
      async (dw) => await dw.getQuestionnaireResponse(id)
    )
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): CanvasAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    settingsSchema.parse(payloadSettings)

  return new CanvasAPIClient({
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}
