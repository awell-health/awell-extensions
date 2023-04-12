import { GraphQLClient } from 'graphql-request'
import {
  type UpdateBaselineInfoInput,
  type DeletePatientInput,
  type EmptyPayload,
  type StartPathwayInput,
  type StartPathwayPayload,
  type UpdatePatientInput,
  type UpdatePatientPayload,
  type DeletePathwayInput,
  type StopPathwayInput,
  type CreatePatientInput,
  type CreatePatientPayload,
} from '../gql/graphql'
import { isNil } from 'lodash'
import {
  createPatientMutation,
  deletePathwayMutation,
  deletePatientMutation,
  startPathwayMutation,
  stopPathwayMutation,
  updateBaselineInfoMutation,
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
    const data = await this.client.request<StartPathwayPayload>(
      startPathwayMutation,
      input
    )

    if (!isNil(data.pathway_id)) {
      return data.pathway_id
    }

    throw new Error('Start care flow failed.')
  }

  async createPatient(input: CreatePatientInput): Promise<string> {
    const data = await this.client.request<CreatePatientPayload>(
      createPatientMutation,
      input
    )

    if (data.success && !isNil(data.patient)) {
      return data.patient.id
    }

    throw new Error('Create patient failed.')
  }

  async updatePatient(input: UpdatePatientInput): Promise<string> {
    const data = await this.client.request<UpdatePatientPayload>(
      updatePatientMutation,
      input
    )

    if (data.success && !isNil(data.patient)) {
      return data.patient.id
    }

    throw new Error('Update patient failed.')
  }

  async deletePatient(input: DeletePatientInput): Promise<boolean> {
    const data = await this.client.request<EmptyPayload>(
      deletePatientMutation,
      input
    )

    if (data.success) {
      return true
    }

    throw new Error('Delete patient failed.')
  }

  async deletePathway(input: DeletePathwayInput): Promise<boolean> {
    const data = await this.client.request<EmptyPayload>(
      deletePathwayMutation,
      input
    )

    if (data.success) {
      return true
    }

    throw new Error('Delete pathway failed.')
  }

  async stopPathway(input: StopPathwayInput): Promise<boolean> {
    const data = await this.client.request<EmptyPayload>(
      stopPathwayMutation,
      input
    )

    if (data.success) {
      return true
    }

    throw new Error('Stop pathway failed.')
  }

  async updateBaselineInfo(input: UpdateBaselineInfoInput): Promise<boolean> {
    const data = await this.client.request<EmptyPayload>(
      updateBaselineInfoMutation,
      input
    )

    if (data.success) {
      return true
    }

    throw new Error('Updating baseline info failed.')
  }
}
