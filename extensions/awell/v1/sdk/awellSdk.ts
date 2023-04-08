import { GraphQLClient } from 'graphql-request'
import {
  type DeletePatientInput,
  type EmptyPayload,
  type StartPathwayInput,
  type StartPathwayPayload,
  type UpdatePatientInput,
  type UpdatePatientPayload,
} from '../gql/graphql'
import { isNil } from 'lodash'
import { createPatientMutation, startPathwayMutation } from './graphql'

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
    const data = await this.client.request<StartPathwayPayload>(
      startPathwayMutation,
      input
    )

    if (!isNil(data.pathway_id)) {
      return data.pathway_id
    }

    throw new Error('Start care flow failed.')
  }

  async updatePatient(input: UpdatePatientInput): Promise<string> {
    const data = await this.client.request<UpdatePatientPayload>(
      createPatientMutation,
      input
    )

    if (data.success && !isNil(data.patient)) {
      return data.patient.id
    }

    throw new Error('Patient update failed')
  }

  async deletePatient(input: DeletePatientInput): Promise<boolean> {
    const data = await this.client.request<EmptyPayload>(
      createPatientMutation,
      input
    )

    if (data.success) {
      return true
    }

    throw new Error('Patient update failed')
  }
}
