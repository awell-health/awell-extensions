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
}
