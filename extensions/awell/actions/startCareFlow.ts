import { type Field, FieldType, type Action } from '../../../lib/types'
import { type settings } from '../settings'
import { GraphQLClient } from 'graphql-request'
import { isNil } from 'lodash'
import {
  type CreatePatientPayload,
  type StartPathwayPayload,
} from '../gql/graphql'
import { Category } from '../../../lib/types/marketplace'

const startPathwayMutation = `
mutation StartPathway($input: StartPathwayInput!) {
  startPathway(input: $input) {
    pathway_id
  }
}
`

const createPatientMutation = `
mutation CreatePatient($input: CreatePatientInput!) {
  createPatient(input: $input) {
    patient {
      id
    }
  }
}
`

const fields = {
  id: {
    id: 'id',
    label: 'Care flow definition ID',
    description: 'The identifier of the care flow definition to start',
    type: FieldType.STRING,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The patient identifier. If not provided an anonymous patient is created',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const createPatient = async (
  client: GraphQLClient,
  patientId?: string
): Promise<string> => {
  if (isNil(patientId)) {
    const data = await client.request<CreatePatientPayload>(
      createPatientMutation,
      {}
    )
    if (data.success && !isNil(data.patient)) {
      return data.patient.id
    }
    throw new Error('Patient creation failed')
  }
  return patientId
}

export const startCareFlow: Action<typeof fields, typeof settings> = {
  key: 'startCareFlow',
  category: Category.WORKFLOW,
  title: 'Start new care flow',
  description: 'Start a new care flow from within the current care flow.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, done): Promise<void> => {
    const { fields, settings } = payload
    const { id, patientId } = fields
    const { apiUrl, apiKey } = settings
    if (apiUrl !== undefined && apiKey !== undefined) {
      const client = new GraphQLClient(apiUrl, { headers: { apikey: apiKey } })
      const patient_id = await createPatient(client, patientId)
      await client.request<StartPathwayPayload>(startPathwayMutation, {
        patient_id,
        pathway_definition_id: id,
      })
    }

    await done()
  },
}
