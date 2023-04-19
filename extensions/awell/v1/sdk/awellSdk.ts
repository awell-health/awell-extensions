import { GraphQLClient } from 'graphql-request'
import {
  type DeletePatientInput,
  type StopPathwayInput,
  type EmptyPayload,
  type StartPathwayInput,
  type StartPathwayPayload,
  type UpdatePatientInput,
  type UpdatePatientPayload,
} from '../gql/graphql'
import { isNil } from 'lodash'
import {
  deletePatientMutation,
  startPathwayMutation,
  stopPathwayMutation,
  updatePatientMutation,
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
}
