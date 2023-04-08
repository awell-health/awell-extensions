import { GraphQLClient } from 'graphql-request'
import {
  type CreatePatientPayload,
  type CreatePatientInput,
  type StartPathwayInput,
  type StartPathwayPayload,
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

  async createPatient(input: CreatePatientInput): Promise<string> {
    const data = await this.client.request<CreatePatientPayload>(
      createPatientMutation
    )

    if (data.success && !isNil(data.patient)) {
      return data.patient.id
    }

    throw new Error('Patient creation failed')
  }

  async startCareFlow(input: StartPathwayInput): Promise<string> {
    const data = await this.client.request<StartPathwayPayload>(
      startPathwayMutation
    )

    if (!isNil(data.pathway_id)) {
      return data.pathway_id
    }

    throw new Error('Start care flow failed.')
  }
}
