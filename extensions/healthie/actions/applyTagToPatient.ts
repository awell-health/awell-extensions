import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../errors'
import { FieldType, type Action, type Field } from '../../../lib/types'
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

export const applyTagToPatient: Action<typeof fields, typeof settings> = {
  key: 'applyTagToPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Apply tag to a patient',
  description: 'Apply a tag to a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, patient_id } = fields
    try {
      if (isNil(id) || isNil(patient_id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` or `patient_id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.applyTagsToUser({
          /**
           * Although the Healthie API allows assigning multiple tags in a single API call, we decided that
           * the action only assigns one as this simplifies the action code. A user can still assign
           * multiple tags simply by adding multiple actions.
           */
          ids: [id],
          taggable_user_id: patient_id,
        })

        if (!isNil(data.bulkApply?.messages)) {
          const errors = mapHealthieToActivityError(data.bulkApply?.messages)
          await onError({
            events: errors,
          })
          return
        }

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
