import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
  type OAuthGrantClientCredentialsRequest,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'
import type { Patient } from './validation/dto/patient.zod'
import type { Appointment } from './validation/dto/appointment.zod'
import type { Task } from './validation/dto/task.zod'
import type { CreatingQuestionnaireResponses } from './validation/dto/questionnaireResponses.zod'

interface Id {
  id: string
}

interface SerchObject<T> {
  resourceType: string
  type: string
  total: number
  entry: Array<{
    resource: T
  }>
}

type PatientResponse = Patient & Id
type AppointmentResponse = Appointment & Id
type TaskResponse = Task & Id

export class CanvasDataWrapper extends DataWrapper {
  public async createPatient(data: Patient): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Patient`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const regex = /.*\/Patient\/(.*?)\/.*/i
    const match = locationHeader.match(regex)
    if (isNil(match)) {
      throw new Error('Error while trying to get created patient ID')
    }
    const [, id] = match
    if (isNil(id)) throw new Error('ID not found in CanvasMedical response.')

    return { id }
  }

  public async updatePatient(data: Patient & Id): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Patient/${data.id}`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }

  public async getPatient(id: string): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'GET',
      url: `/Patient/${id}`,
    })
    const res = await req
    return res
  }

  public async createAppointment(data: Appointment): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Appointment`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }

  public async updateAppointment(data: Appointment & Id): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Appointment/${data.id}`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }

  public async getAppointment(id: string): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'GET',
      url: `/Appointment/${id}`,
    })
    const res = await req
    return res
  }

  public async createTask(data: Task): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/Task`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }

  public async updateTask(data: Task & Id): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'PUT',
      url: `/Task/${data.id}`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }

  public async getTask(id: string): Promise<TaskResponse> {
    const response = await this.Request<SerchObject<TaskResponse>>({
      method: 'GET',
      url: `/Task?_id=${id}`,
    })
    if (response.total === 0) throw new Error('Task not found')
    return response.entry[0].resource
  }

  public async createQuestionnaireResponses(
    data: CreatingQuestionnaireResponses
  ): Promise<Id> {
    const response = await this.RequestRaw({
      method: 'POST',
      url: `/QuestionnaireResponse`,
      data,
    })

    const locationHeader = response.headers.location
    if (isNil(locationHeader)) throw new Error('Location header not found.')

    const id = locationHeader.match(/\/([^/]+)\/_history/)?.[1]
    if (isNil(id)) throw new Error('ID not found in location header.')

    return { id }
  }
}

interface CanvasAPIClientConstrutorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
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

  public async getAppointment(id: string): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.getAppointment(id))
  }

  public async createAppointment(obj: Appointment): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createAppointment(obj))
  }

  public async updateAppointment(obj: Appointment & Id): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updateAppointment(obj))
  }

  public async getPatient(id: string): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createPatient(obj: Patient): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(obj: Patient & Id): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updatePatient(obj))
  }

  public async getTask(id: string): Promise<TaskResponse> {
    return await this.FetchData(async (dw) => await dw.getTask(id))
  }

  public async createTask(obj: Task): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.createTask(obj))
  }

  public async updateTask(obj: Task & Id): Promise<Id> {
    return await this.FetchData(async (dw) => await dw.updateTask(obj))
  }

  public async createQuestionnaireResponses(
    obj: CreatingQuestionnaireResponses
  ): Promise<Id> {
    return await this.FetchData(
      async (dw) => await dw.createQuestionnaireResponses(obj)
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
