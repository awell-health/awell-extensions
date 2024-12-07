import {
  APIClient,
  DataWrapper,
  OAuthPassword,
  type DataWrapperCtor,
  type OAuthGrantPasswordRequest,
} from '@awell-health/extensions-core'
import { type settings } from './settings'
import {
  type FindAppointmentsParams,
  type AppointmentInput,
  type AppointmentResponse,
  type ElationCollection,
  type PatientInput,
  type PatientResponse,
  type UpdatePatientInput,
  type Subscription,
  type SubscriptionRequest,
  type PhysicianResponse,
  type NonVisitNoteInput,
  type NonVisitNoteResponse,
  type GetLetterInputType,
  type GetLetterResponseType,
  type PostLetterInput,
  type PostLetterResponse,
  type CreateLabOrderInput,
  type CreateLabOrderResponse,
  type FindContactsResponse,
  type MessageThreadInput,
  type MessageThreadResponse,
  type addHistoryInput,
  type addHistoryResponse,
  type AddAllergyInputType,
  type AddAllergyResponseType,
  type CreateVisitNoteInputType,
  type CreateVisitNoteResponseType,
  type PharmacyResponse,
  type AddVitalsInputType,
  type AddVitalsResponseType,
  PharmacySchema,
} from './types'
import { settingsSchema } from './validation/settings.zod'
import { elationCacheService } from './cache'

export class ElationDataWrapper extends DataWrapper {
  public async findAppointments(
    params: FindAppointmentsParams
  ): Promise<AppointmentResponse[]> {
    const req = this.Request<ElationCollection<AppointmentResponse>>({
      method: 'GET',
      url: `/appointments/`,
      params,
    })
    const res = await req
    return res.results
  }

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
    obj: Partial<UpdatePatientInput>
  ): Promise<PatientResponse> {
    const req = this.Request<PatientResponse>({
      method: 'PATCH',
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

  public async getPhysician(id: number): Promise<PhysicianResponse> {
    const req = this.Request<PhysicianResponse>({
      method: 'GET',
      url: `/physicians/${id}`,
    })
    const res = await req
    return res
  }

  public async getLetter(id: number): Promise<GetLetterResponseType> {
    const req = this.Request<GetLetterResponseType>({
      method: 'GET',
      url: `/letters/${id}`,
    })
    const res = await req
    return res
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

  public async getNonVisitNote(id: number): Promise<NonVisitNoteResponse> {
    return await this.Request({
      method: 'GET',
      url: `/non_visit_notes/${id}`,
    })
  }

  public async createNonVisitNote(
    obj: NonVisitNoteInput
  ): Promise<NonVisitNoteResponse> {
    return await this.Request({
      method: 'POST',
      url: '/non_visit_notes/',
      data: obj,
    })
  }

  public async updateNonVisitNote(
    id: number,
    obj: Partial<NonVisitNoteInput>
  ): Promise<NonVisitNoteResponse> {
    return await this.Request({
      // PATCH - makes all fields optional in Elation (PUT requires all fields)
      method: 'PATCH',
      url: `/non_visit_notes/${id}`,
      data: obj,
    })
  }

  public async deleteNonVisitNote(id: number): Promise<void> {
    await this.Request({
      method: 'DELETE',
      url: `/non_visit_notes/${id}`,
    })
  }

  public async postLetter(obj: PostLetterInput): Promise<PostLetterResponse> {
    return await this.Request({
      method: 'POST',
      url: '/letters',
      data: obj,
    })
  }

  public async findContacts(obj: {
    npi: string
  }): Promise<FindContactsResponse> {
    return await this.Request({
      method: 'GET',
      url: `/contacts?npi=${obj.npi}`,
    })
  }

  public async createLabOrder(
    obj: CreateLabOrderInput
  ): Promise<CreateLabOrderResponse> {
    return await this.Request({
      method: 'POST',
      url: '/lab_orders',
      data: obj,
    })
  }

  public async createMessageThread(
    obj: MessageThreadInput
  ): Promise<MessageThreadResponse> {
    const req = this.Request<MessageThreadResponse>({
      method: 'POST',
      url: `/message_threads`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async addHistory(obj: addHistoryInput): Promise<addHistoryResponse> {
    const req = this.Request<addHistoryResponse>({
      method: 'POST',
      url: `/histories`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async addAllergy(
    obj: AddAllergyInputType
  ): Promise<AddAllergyResponseType> {
    const req = this.Request<AddAllergyResponseType>({
      method: 'POST',
      url: `/allergies`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async createVisitNote(
    obj: CreateVisitNoteInputType
  ): Promise<CreateVisitNoteResponseType> {
    const req = this.Request<CreateVisitNoteResponseType>({
      method: 'POST',
      url: `/visit_notes`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async addVitals(
    obj: AddVitalsInputType
  ): Promise<AddVitalsResponseType> {
    const req = this.Request<AddVitalsResponseType>({
      method: 'POST',
      url: `/vitals`,
      data: obj,
    })
    const res = await req
    return res
  }

  public async getPharmacy(ncpdpId: string): Promise<PharmacyResponse> {
    return PharmacySchema.parse(
      await this.Request<PharmacyResponse>({
        method: 'GET',
        url: `/pharmacies/${ncpdpId}`,
      })
    )
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
        useHeaderInAuthorization: true,
      }),
    })
  }

  public async findAppointments(
    params: FindAppointmentsParams
  ): Promise<AppointmentResponse[]> {
    return await this.FetchData(async (dw) => await dw.findAppointments(params))
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
    obj: Partial<UpdatePatientInput>
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

  public async getPhysician(id: number): Promise<PhysicianResponse> {
    return await this.FetchData(async (dw) => await dw.getPhysician(id))
  }

  public async getLetter(
    id: GetLetterInputType
  ): Promise<GetLetterResponseType> {
    return await this.FetchData(async (dw) => await dw.getLetter(id))
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

  public async getNonVisitNote(id: number): Promise<NonVisitNoteResponse> {
    return await this.FetchData(async (dw) => await dw.getNonVisitNote(id))
  }

  public async createNonVisitNote(
    obj: NonVisitNoteInput
  ): Promise<NonVisitNoteResponse> {
    return await this.FetchData(async (dw) => await dw.createNonVisitNote(obj))
  }

  public async updateNonVisitNote(
    id: number,
    obj: Partial<NonVisitNoteInput>
  ): Promise<NonVisitNoteResponse> {
    return await this.FetchData(
      async (dw) => await dw.updateNonVisitNote(id, obj)
    )
  }

  public async deleteNonVisitNote(id: number): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.deleteNonVisitNote(id)
    })
  }

  public async postNewLetter(
    obj: PostLetterInput
  ): Promise<PostLetterResponse> {
    return await this.FetchData(async (dw) => await dw.postLetter(obj))
  }

  public async searchContactsByNpi(obj: {
    npi: string
  }): Promise<FindContactsResponse> {
    return await this.FetchData(async (dw) => await dw.findContacts(obj))
  }

  public async createLabOrder(
    obj: CreateLabOrderInput
  ): Promise<CreateLabOrderResponse> {
    return await this.FetchData(async (dw) => await dw.createLabOrder(obj))
  }

  public async addHistory(obj: addHistoryInput): Promise<addHistoryResponse> {
    return await this.FetchData(async (dw) => await dw.addHistory(obj))
  }

  public async createMessageThread(
    obj: MessageThreadInput
  ): Promise<MessageThreadResponse> {
    return await this.FetchData(async (dw) => await dw.createMessageThread(obj))
  }

  public async addAllergy(
    obj: AddAllergyInputType
  ): Promise<AddAllergyResponseType> {
    return await this.FetchData(async (dw) => await dw.addAllergy(obj))
  }

  public async createVisitNote(
    obj: CreateVisitNoteInputType
  ): Promise<CreateVisitNoteResponseType> {
    return await this.FetchData(async (dw) => await dw.createVisitNote(obj))
  }

  public async addVitals(
    obj: AddVitalsInputType
  ): Promise<AddVitalsResponseType> {
    return await this.FetchData(async (dw) => await dw.addVitals(obj))
  }

  public async getPharmacy(ncpdpId: string): Promise<PharmacyResponse> {
    return await this.FetchData(async (dw) => await dw.getPharmacy(ncpdpId))
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
