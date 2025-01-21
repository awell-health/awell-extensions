import {
  APIClient,
  DataWrapper,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
  type OAuthGrantRequest,
  OAuthPassword,
  type DataWrapperCtor,
  type OAuthGrantPasswordRequest,
} from '@awell-health/extensions-core'
import { SettingsValidationSchema } from './settings'
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
  type PostCareGapInput,
  type CareGapResponse,
  type CloseCareGapInput,
  type PostReferralOrderInput,
  type PostReferralOrderResponse,
  type GetReferralOrderInputType,
  type GetReferralOrderResponseType,
} from './types'
import { elationCacheService } from './cache'
import { isEmpty } from 'lodash'
import { type DeepPartial } from '../../src/lib/types'

export class ElationDataWrapper extends DataWrapper {
  public async findAppointments(
    params: FindAppointmentsParams,
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
    obj: Partial<AppointmentInput>,
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
    obj: Partial<PatientInput>,
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
    obj: Partial<UpdatePatientInput>,
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
    obj: SubscriptionRequest,
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

  public async getReferralOrder(
    id: number,
  ): Promise<GetReferralOrderResponseType> {
    const req = this.Request<GetReferralOrderResponseType>({
      method: 'GET',
      url: `/referral_orders/${id}`,
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
    obj: NonVisitNoteInput,
  ): Promise<NonVisitNoteResponse> {
    return await this.Request({
      method: 'POST',
      url: '/non_visit_notes/',
      data: obj,
    })
  }

  public async updateNonVisitNote(
    id: number,
    obj: Partial<NonVisitNoteInput>,
  ): Promise<NonVisitNoteResponse> {
    return await this.Request({
      // PATCH - makes all fields optional in Elation (PUT requires all fields)
      method: 'PATCH',
      url: `/non_visit_notes/${id}`,
      data: obj,
    })
  }

  public async updateReferralOrder(
    id: number,
    obj: DeepPartial<PostReferralOrderInput>,
  ): Promise<PostReferralOrderResponse> {
    return await this.Request({
      // PATCH - makes all fields optional in Elation (PUT requires all fields)
      method: 'PATCH',
      url: `/referral_orders/${id}`,
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

  public async listContacts(obj: {
    npi: string
  }): Promise<FindContactsResponse> {
    return await this.Request({
      method: 'GET',
      url: `/contacts?npi=${obj.npi}`,
    })
  }

  public async searchContacts(obj: {
    name: string
  }): Promise<FindContactsResponse> {
    return await this.Request({
      method: 'GET',
      url: `/contacts?name=${obj.name}`,
    })
  }

  public async createLabOrder(
    obj: CreateLabOrderInput,
  ): Promise<CreateLabOrderResponse> {
    return await this.Request({
      method: 'POST',
      url: '/lab_orders',
      data: obj,
    })
  }

  public async createMessageThread(
    obj: MessageThreadInput,
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
    obj: AddAllergyInputType,
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
    obj: CreateVisitNoteInputType,
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
    obj: AddVitalsInputType,
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
      }),
    )
  }

  public async createReferralOrder(
    obj: PostReferralOrderInput,
  ): Promise<PostReferralOrderResponse> {
    return await this.Request({
      method: 'POST',
      url: '/referral_orders',
      data: obj,
    })
  }

  public async findPractices(): Promise<ElationCollection<any>> {
    return await this.Request({
      method: 'GET',
      url: '/practices',
    })
  }

  public async createCareGap(obj: PostCareGapInput): Promise<CareGapResponse> {
    const { quality_program, ...data } = obj
    return await this.Request({
      method: 'POST',
      url: `/${quality_program}/caregap/`,
      data,
    })
  }

  public async closeCareGap(obj: CloseCareGapInput): Promise<CareGapResponse> {
    const { quality_program, caregap_id, status } = obj
    return await this.Request({
      method: 'POST',
      url: `/${quality_program}/caregap/${caregap_id}/`,
      data: {
        status,
      },
    })
  }
}

interface ElationAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantRequest, 'grant_type'>
  baseUrl: string
}

export class ElationAPIClient extends APIClient<ElationDataWrapper> {
  readonly ctor: DataWrapperCtor<ElationDataWrapper> = (
    token: string,
    baseUrl: string,
  ) => new ElationDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: ElationAPIClientConstructorProps) {
    const getAuth = (): OAuthPassword | OAuthClientCredentials => {
      if ('username' in requestConfig && 'password' in requestConfig) {
        return new OAuthPassword({
          auth_url: authUrl,
          request_config: requestConfig as Omit<
            OAuthGrantPasswordRequest,
            'grant_type'
          >,
          cacheService: elationCacheService,
          useHeaderInAuthorization: true,
        })
      }

      return new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig satisfies Omit<
          OAuthGrantClientCredentialsRequest,
          'grant_type'
        >,
        cacheService: elationCacheService,
      })
    }

    super({
      ...opts,
      auth: getAuth(),
    })
  }

  public async findAppointments(
    params: FindAppointmentsParams,
  ): Promise<AppointmentResponse[]> {
    return await this.FetchData(async (dw) => await dw.findAppointments(params))
  }

  public async getAppointment(id: number): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.getAppointment(id))
  }

  public async createAppointment(
    obj: Partial<AppointmentInput>,
  ): Promise<AppointmentResponse> {
    return await this.FetchData(async (dw) => await dw.createAppointment(obj))
  }

  public async getPatient(id: number): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.getPatient(id))
  }

  public async createPatient(
    obj: Partial<PatientInput>,
  ): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.createPatient(obj))
  }

  public async updatePatient(
    id: number,
    obj: Partial<UpdatePatientInput>,
  ): Promise<PatientResponse> {
    return await this.FetchData(async (dw) => await dw.updatePatient(id, obj))
  }

  public async findSubscriptions(): Promise<Subscription[]> {
    return await this.FetchData(async (dw) => await dw.findSubscriptions())
  }

  public async createSubscription(
    obj: SubscriptionRequest,
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
    id: GetLetterInputType,
  ): Promise<GetLetterResponseType> {
    return await this.FetchData(async (dw) => await dw.getLetter(id))
  }

  public async getReferralOrder(
    id: GetReferralOrderInputType,
  ): Promise<GetReferralOrderResponseType> {
    return await this.FetchData(async (dw) => await dw.getReferralOrder(id))
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
      async (dw) => await dw.findPhysicians({ params }),
    )
  }

  public async getNonVisitNote(id: number): Promise<NonVisitNoteResponse> {
    return await this.FetchData(async (dw) => await dw.getNonVisitNote(id))
  }

  public async createNonVisitNote(
    obj: NonVisitNoteInput,
  ): Promise<NonVisitNoteResponse> {
    return await this.FetchData(async (dw) => await dw.createNonVisitNote(obj))
  }

  public async updateNonVisitNote(
    id: number,
    obj: Partial<NonVisitNoteInput>,
  ): Promise<NonVisitNoteResponse> {
    return await this.FetchData(
      async (dw) => await dw.updateNonVisitNote(id, obj),
    )
  }

  public async updateReferralOrder(
    id: number,
    obj: DeepPartial<PostReferralOrderInput>,
  ): Promise<PostReferralOrderResponse> {
    return await this.FetchData(
      async (dw) => await dw.updateReferralOrder(id, obj),
    )
  }

  public async deleteNonVisitNote(id: number): Promise<void> {
    await this.FetchData(async (dw) => {
      await dw.deleteNonVisitNote(id)
    })
  }

  public async postNewLetter(
    obj: PostLetterInput,
  ): Promise<PostLetterResponse> {
    return await this.FetchData(async (dw) => await dw.postLetter(obj))
  }

  public async searchContactsByNpi(obj: {
    npi: string
  }): Promise<FindContactsResponse> {
    return await this.FetchData(async (dw) => await dw.listContacts(obj))
  }

  public async searchContactsByName(obj: {
    name: string
  }): Promise<FindContactsResponse> {
    return await this.FetchData(async (dw) => await dw.searchContacts(obj))
  }

  public async createLabOrder(
    obj: CreateLabOrderInput,
  ): Promise<CreateLabOrderResponse> {
    return await this.FetchData(async (dw) => await dw.createLabOrder(obj))
  }

  public async addHistory(obj: addHistoryInput): Promise<addHistoryResponse> {
    return await this.FetchData(async (dw) => await dw.addHistory(obj))
  }

  public async createMessageThread(
    obj: MessageThreadInput,
  ): Promise<MessageThreadResponse> {
    return await this.FetchData(async (dw) => await dw.createMessageThread(obj))
  }

  public async addAllergy(
    obj: AddAllergyInputType,
  ): Promise<AddAllergyResponseType> {
    return await this.FetchData(async (dw) => await dw.addAllergy(obj))
  }

  public async createVisitNote(
    obj: CreateVisitNoteInputType,
  ): Promise<CreateVisitNoteResponseType> {
    return await this.FetchData(async (dw) => await dw.createVisitNote(obj))
  }

  public async addVitals(
    obj: AddVitalsInputType,
  ): Promise<AddVitalsResponseType> {
    return await this.FetchData(async (dw) => await dw.addVitals(obj))
  }

  public async getPharmacy(ncpdpId: string): Promise<PharmacyResponse> {
    return await this.FetchData(async (dw) => await dw.getPharmacy(ncpdpId))
  }

  public async createReferralOrder(
    obj: PostReferralOrderInput,
  ): Promise<PostReferralOrderResponse> {
    return await this.FetchData(async (dw) => await dw.createReferralOrder(obj))
  }

  public async findPractices(): Promise<ElationCollection<any>> {
    return await this.FetchData(async (dw) => await dw.findPractices())
  }

  public async createCareGap(obj: PostCareGapInput): Promise<CareGapResponse> {
    return await this.FetchData(async (dw) => await dw.createCareGap(obj))
  }

  public async closeCareGap(obj: CloseCareGapInput): Promise<CareGapResponse> {
    return await this.FetchData(async (dw) => await dw.closeCareGap(obj))
  }
}

export const makeAPIClient = (
  settings: Record<string, unknown>,
): ElationAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    SettingsValidationSchema.parse(settings)

  /**
   * Determines the OAuth grant type based on the provided settings.
   * Currently, we support both the "password" and "client_credentials" grant types for backward compatibility.
   * - "password" grant is still supported to avoid breaking existing care flows that rely on it.
   * - "client_credentials" grant is the preferred method for authentication as per the latest Elation API guidance.
   * Once all existing care flows are migrated, support for the "password" grant can be deprecated.
   */
  const getGrantType = (): 'password' | 'client_credentials' => {
    if (
      isEmpty(auth_request_settings.username) ||
      isEmpty(auth_request_settings.password)
    )
      return 'client_credentials'

    return 'password'
  }

  const grantType = getGrantType()

  /**
   * Builds the appropriate request configuration based on the selected grant type.
   * - For "client_credentials", only the client ID and client secret are required.
   * - For "password", username and password are included for compatibility with older flows.
   */
  const getRequestConfig = ():
    | Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
    | Omit<OAuthGrantPasswordRequest, 'grant_type'> => {
    if (grantType === 'client_credentials')
      return {
        client_id: auth_request_settings.client_id,
        client_secret: auth_request_settings.client_secret,
      } satisfies Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>

    return {
      client_id: auth_request_settings.client_id,
      client_secret: auth_request_settings.client_secret,
      username: auth_request_settings.username as string,
      password: auth_request_settings.password as string,
    } satisfies Omit<OAuthGrantPasswordRequest, 'grant_type'>
  }

  return new ElationAPIClient({
    authUrl: auth_url,
    baseUrl: base_url,
    requestConfig: getRequestConfig(),
  })
}
