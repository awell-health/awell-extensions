import {
  APIClient,
  DataWrapper,
  OAuthPassword,
  type DataWrapperCtor,
  type OAuthGrantPasswordRequest,
} from '@awell-health/extensions-core'
import { type settings } from './settings'
import {
  type AppointmentInput,
  type AppointmentResponse,
} from './types/appointment'
import { type ElationCollection } from './types/generic'
import { type PatientInput, type PatientResponse } from './types/patient'
import {
  type Subscription,
  type SubscriptionRequest,
} from './types/subscription'
import { settingsSchema } from './validation/settings.zod'
import { elationCacheService } from './cache'
import { type PhysicianResponse } from './types/physician'

export class ElationDataWrapper extends DataWrapper {
  public async getAppointment(id: number): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'GET',
      url: `/appointments/${id}`,
    })
    const res = await req
    return res
  }

  public async createAppointment(
    obj: Partial<AppointmentInput>
  ): Promise<AppointmentResponse> {
    const req = this.Request<AppointmentResponse>({
      method: 'POST',
      url: `/appointments`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async getPatient(id: number): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'GET',
      url: `/patients/${id}`,
    })
    const res = await req
    return res
  }

  public async createPatient(
    obj: Partial<PatientInput>
  ): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'POST',
      url: `/patients`,
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
      url: `/patients/${id}`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async findSubscriptions(): Promise<Subscription[]> {
    const req = this.Request<ElationCollection<Subscription>>({
      method: 'GET',
      url: '/app/subscriptions/',
    })
    const res = await req
    return res.results
  }

  public async createSubscription(
    obj: SubscriptionRequest
  ): Promise<Subscription> {
    const req = this.Request<Subscription>({
      method: 'POST',
      url: '/app/subscriptions/',
      data: obj,
    })
    const res = await req
    return res
  }

  public async deleteSubscription(id: number): Promise<void> {
    const req = this.Request({
      method: 'DELETE',
      url: `/app/subscriptions/${id}/`,
    })
    await req
  }

  public async findPhysicians({
    params,
  }: {
    params?: {
      first_name?: string
      last_name?: string
      npi?: string
    }
  }): Promise<ElationCollection<PhysicianResponse>> {
    return await this.Request({
      method: 'GET',
      url: '/physicians/',
      params,
    })
  }
}

interface ElationAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantPasswordRequest, 'grant_type'>
  baseUrl: string
}

export class ElationAPIClient extends APIClient<ElationDataWrapper> {
  readonly ctor: DataWrapperCtor<ElationDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new ElationDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: ElationAPIClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthPassword({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService: elationCacheService,
      }),
    })
  }

  public async getAppointment(id: number): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.getAppointment(id))
  }

  public async createAppointment(
    obj: Partial<AppointmentInput>
  ): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.createAppointment(obj))
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

  public async findSubscriptions(): Promise<Subscription[]> {
    return await this.FetchData(async (dw) => await dw.findSubscriptions())
  }

  public async createSubscription(
    obj: SubscriptionRequest
  ): Promise<Subscription> {
    return await this.FetchData(async (dw) => await dw.createSubscription(obj))
  }

  public async deleteSubscription(id: number): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.deleteSubscription(id)
    })
  }

  public async findPhysicians({
    params,
  }: {
    params?: {
      first_name?: string
      last_name?: string
      npi?: string
    }
  }): Promise<ElationCollection<PhysicianResponse>> {
    return await this.FetchData(
      async (dw) => await dw.findPhysicians({ params })
    )
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): ElationAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    settingsSchema.parse(payloadSettings)

  return new ElationAPIClient({
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}
