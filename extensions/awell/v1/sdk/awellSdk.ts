import { GraphQLClient } from 'graphql-request'
import {
  type DeletePatientInput,
  type StopPathwayInput,
  type EmptyPayload,
  type StartPathwayInput,
  type StartPathwayPayload,
  type UpdatePatientInput,
  type UpdatePatientPayload,
  type UpdateBaselineInfoInput,
  type QuerySearchPatientsByPatientCodeArgs,
  type SearchPatientsPayload,
  type UserProfile,
  type User,
  type PatientPathwaysPayload,
  type PatientPathway,
  type PatientPayload,
  type AddIdentifierToPatientInput,
  type Maybe,
  type QueryPathwayActivitiesArgs,
  type Activity,
  type ActivitiesPayload,
  type QueryFormArgs,
  type Form,
  type FormPayload,
  type QueryFormResponseArgs,
  type FormResponse,
  type FormResponsePayload,
  type QueryCalculationResultsArgs,
  type CalculationResultsPayload,
  type SingleCalculationResult,
} from '../gql/graphql'
import { isNil } from 'lodash'
import {
  deletePatientMutation,
  patientPathwaysQuery,
  startPathwayMutation,
  stopPathwayMutation,
  updatePatientMutation,
  searchPatientByPatientCodeQuery,
  updateBaselineInfoMutation,
  getPatientByIdentifierQuery,
  addIdentifierToPatientMutation,
  GetPathwayActivitiesQuery,
  GetFormQuery,
  GetFormResponseQuery,
  GetCalculationResultsQuery,
} from './graphql'

export default class AwellSdk {
  readonly apiUrl: string
  readonly apiKey: string
  readonly client: GraphQLClient

  constructor(opts: { apiUrl: string; apiKey: string }) {
    this.apiUrl = opts.apiUrl
    this.apiKey = opts.apiKey

    const client = new GraphQLClient(this.apiUrl, {
      headers: { apikey: this.apiKey },
    })

    this.client = client
  }

  async startCareFlow(input: StartPathwayInput): Promise<string> {
    const data = await this.client.request<{
      startPathway: StartPathwayPayload
    }>(startPathwayMutation, { input })

    if (!isNil(data.startPathway.pathway_id)) {
      return data.startPathway.pathway_id
    }

    throw new Error('Start care flow failed.')
  }

  async updatePatient(input: UpdatePatientInput): Promise<string> {
    const data = await this.client.request<{
      updatePatient: UpdatePatientPayload
    }>(updatePatientMutation, { input })

    if (data.updatePatient.success && !isNil(data.updatePatient.patient)) {
      return data.updatePatient.patient.id
    }

    throw new Error('Update patient failed.')
  }

  async deletePatient(input: DeletePatientInput): Promise<boolean> {
    const data = await this.client.request<{ deletePatient: EmptyPayload }>(
      deletePatientMutation,
      { input }
    )

    if (data.deletePatient.success) {
      return true
    }

    throw new Error('Delete patient failed.')
  }

  async stopCareFlow(input: StopPathwayInput): Promise<boolean> {
    const data = await this.client.request<{ stopPathway: EmptyPayload }>(
      stopPathwayMutation,
      {
        input,
      }
    )

    if (data.stopPathway.success) {
      return true
    }

    throw new Error('Stop pathway failed.')
  }

  async searchPatientsByPatientCode(
    input: QuerySearchPatientsByPatientCodeArgs
  ): Promise<
    Array<
      Pick<User, 'id'> & {
        profile: Pick<UserProfile, 'patient_code'>
      }
    >
  > {
    const data = await this.client.request<{
      searchPatientsByPatientCode: SearchPatientsPayload
    }>(searchPatientByPatientCodeQuery, input)

    if (data.searchPatientsByPatientCode.success) {
      const patientIdsArray = data.searchPatientsByPatientCode.patients.map(
        (patient) => {
          return {
            id: patient.id,
            profile: {
              patient_code: patient.profile?.patient_code,
            },
          }
        }
      )

      return patientIdsArray
    }

    throw new Error('Search patients failed.')
  }

  async getPatientCareFlows(input: {
    patient_id: string
    status?: string[]
  }): Promise<PatientPathway[]> {
    const data = await this.client.request<{
      patientPathways: PatientPathwaysPayload
    }>(patientPathwaysQuery, input)

    if (data.patientPathways.success) {
      return data.patientPathways.patientPathways
    }

    throw new Error('Stop pathway failed.')
  }

  async updateBaselineInfo(input: UpdateBaselineInfoInput): Promise<boolean> {
    const data = await this.client.request<{
      updateBaselineInfo: { code: string; success: boolean }
    }>(updateBaselineInfoMutation, { input })

    if (data.updateBaselineInfo.success) {
      return true
    }
    let msg: string = ''
    if (data.updateBaselineInfo.code === '200') {
      msg = JSON.stringify((data as unknown as { errors: any }).errors)
    }
    throw new Error(`Update baseline info failed. ${msg}`)
  }

  async getPatientByIdentifier(input: {
    system: string
    value: string
  }): Promise<Maybe<User> | undefined> {
    const data = await this.client.request<{
      patientByIdentifier: PatientPayload
    }>(getPatientByIdentifierQuery, input)

    return data.patientByIdentifier.patient
  }

  async addIdentifierToPatient(
    input: AddIdentifierToPatientInput
  ): Promise<boolean> {
    const data = await this.client.request<{
      addIdentifierToPatient: { code: string; success: boolean }
    }>(addIdentifierToPatientMutation, { input })

    if (data.addIdentifierToPatient.success) {
      return true
    }

    throw new Error('Failed to add identifier to patient.')
  }

  async getPathwayActivities(
    input: QueryPathwayActivitiesArgs
  ): Promise<Activity[]> {
    const data = await this.client.request<{
      pathwayActivities: ActivitiesPayload
    }>(GetPathwayActivitiesQuery, input)

    if (data.pathwayActivities.success) {
      return data.pathwayActivities.activities
    }

    throw new Error('Retrieving pathway activities failed')
  }

  async getForm(input: QueryFormArgs): Promise<Form> {
    const data = await this.client.request<{
      form: FormPayload
    }>(GetFormQuery, input)

    if (data.form.form != null) {
      return data.form.form
    }

    throw new Error(`Retrieving form ${input.id} failed`)
  }

  async getFormResponse(input: QueryFormResponseArgs): Promise<FormResponse> {
    const data = await this.client.request<{
      formResponse: FormResponsePayload
    }>(GetFormResponseQuery, input)

    if (data.formResponse.success) {
      return data.formResponse.response
    }

    throw new Error(
      `Retrieving form response for activity ${input.activity_id} failed`
    )
  }

  async getCalculationResults(
    input: QueryCalculationResultsArgs
  ): Promise<SingleCalculationResult[]> {
    const data = await this.client.request<{
      calculationResults: CalculationResultsPayload
    }>(GetCalculationResultsQuery, input)

    if (data.calculationResults.success) {
      return data.calculationResults.result
    }

    throw new Error(
      `Retrieving calculation results for activity ${input.activity_id} failed`
    )
  }
}
