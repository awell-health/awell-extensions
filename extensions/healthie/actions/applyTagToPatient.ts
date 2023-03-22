import { isNil } from 'lodash'
import {
  FieldType,
  type Action,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'


const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The ID of the tag to add to the patient.',
    type: FieldType.STRING,
    required: true,
  },
  patient_id: {
    id: 'patient_id',
    label: 'Patient ID',
    description: 'The ID of the patient to apply the tag on.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const applyTagToPatient: Action<
  typeof fields,
  typeof settings
> = {
  key: 'applyTagToPatient',
  category: Category.INTEGRATIONS,
  title: 'Apply tag to a patient',
  description: 'Apply tag to a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, patient_id } = fields
    try {
      if (isNil(id) || isNil(patient_id)) throw new Error(`Fields are missing!: ${JSON.stringify(fields)}}`)

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)


        await sdk.applyTagsToUser({
          ids: [id],
          taggable_user_id: patient_id
        })

        await onComplete()
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API client requires an API url and API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing api url or api key',
              },
            },
          ],
        })
      }
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Healthie API reported an error' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}