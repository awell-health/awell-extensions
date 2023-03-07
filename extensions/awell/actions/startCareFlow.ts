import { type Field, FieldType, type Action } from '../../../lib/types'
import { type settings } from '../settings'
import { GraphQLClient } from 'graphql-request'

const mutation = `
mutation StartPathway($input: StartPathwayInput!) {
  startPathway(input: $input) {
    pathway_id
  }
}
`

const fields = {
  id: {
    id: 'id',
    label: 'Care flow definition ID',
    description: 'The identifier of the care flow definition to start',
    type: FieldType.TEXT,
  },
} satisfies Record<string, Field>

export const startCareFlow: Action<typeof fields, typeof settings> = {
  key: 'startCareFlow',
  category: 'orchestration',
  title: 'Start a new care flow for the current patient',
  fields,
  previewable: true,
  onActivityCreated: async (payload, done): Promise<void> => {
    const { fields, settings } = payload
    const { id } = fields
    const { apiUrl, apiKey } = settings
    if (apiUrl !== undefined && apiKey !== undefined) {
      const client = new GraphQLClient(apiUrl, { headers: { apikey: apiKey } })
      const data = await client.request(mutation, {
        patient_id: 'TBC',
        pathway_definition_id: id,
      })
      console.log('Response', data)
    }

    await done()
  },
}
