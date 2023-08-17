import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
  type OAuthGrantClientCredentialsRequest,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import {isNil} from 'lodash'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'
import type { Patient } from './validation/dto/patient.zod'
import type { Appointment } from './validation/dto/appointment.zod'
import type { Task } from './validation/dto/task.zod'

interface WithId {
  id: string
}

type PatientResponse = Patient & WithId
type AppointmentResponse = Appointment & WithId
type TaskResponse = Task & WithId

export class CanvasDataWrapper extends DataWrapper {
  public async createPatient(data: Patient): Promise<string> {
    const res = await this._client.request({
      method: 'POST',
      url: '/Patient',
      data,
    })
    const regex = /.*\/Patient\/(.*?)\/.*/i
    const { location } = res.headers
    const match = location.match(regex)
    if (isNil(match)) {
      throw new Error('Error while trying to get created patient id')
    }
    const [, id] = match
    return id
  }

  public async updatePatient(data: Patient & WithId): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'PUT',
      url: `/Patient/${data.id}`,
      data,
    })
    const res = await req
    return res
  }

  public async getPatient(id: string): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'GET',
      url: `/Patient/${id}`,
    })
    const res = await req
    return res
  }

  public async createAppointment(
    data: Appointment
  ): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'POST',
      url: `/Appointment`,
      data,
    })
    const res = await req
    return res
  }

  public async updateAppointment(
    data: Appointment & WithId
  ): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'PUT',
      url: `/Appointment/${data.id}`,
      data,
    })
    const res = await req
    return res
  }

  public async getAppointment(id: string): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'GET',
      url: `/Appointment/${id}`,
    })
    const res = await req
    return res
  }

  public async createTask(data: Task): Promise<TaskResponse> {
    const req = this.Request<TaskResponse>({
      method: 'POST',
      url: `/Task`,
      data,
    })
    const res = await req
    return res
  }

  public async updateTask(data: Task & WithId): Promise<TaskResponse> {
    const req = this.Request<TaskResponse>({
      method: 'PUT',
      url: `/Task/${data.id}`,
      data,
    })
    const res = await req
    return res
  }

  public async getTask(id: string): Promise<TaskResponse> {
    const req = this.Request<TaskResponse>({
      method: 'GET',
      url: `/Task/${id}`,
    })
    const res = await req
    return res
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

  public async createAppointment(
    obj: Appointment
  ): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.createAppointment(obj))
  }

  public async updateAppointment(
    obj: Appointment & WithId
  ): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.updateAppointment(obj))
  }

  public async getPatient(id: string): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createPatient(obj: Patient): Promise<string> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(obj: Patient & WithId): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.updatePatient(obj))
  }

  public async getTask(id: string): Promise<TaskResponse> {
    return await this.FetchData(async (dw) => await dw.getTask(id))
  }

  public async createTask(obj: Task): Promise<TaskResponse> {
    return await this.FetchData(async (dw) => await dw.createTask(obj))
  }

  public async updateTask(obj: Task & WithId): Promise<TaskResponse> {
    return await this.FetchData(async (dw) => await dw.updateTask(obj))
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
