import { isNil } from 'lodash'
import {
  FieldType,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { HealthieError, mapHealthieToActivityError } from '../errors'

const fields = {
  id: {
    id: 'id',
    label: 'Patient ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  groupId: {
    id: 'groupId',
    label: 'Group ID',
    description:
      'The ID of the group the patient will be assigned to. Leave blank to remove the patient from a group.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const assignPatientToGroup: Action<typeof fields, typeof settings> = {
  key: 'assignPatientToGroup',
  category: Category.EHR_INTEGRATIONS,
  title: 'Assign patient to group',
  description: 'Assign or remove a patient from a group in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, groupId } = fields
    try {
      if (isNil(id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        await sdk.updatePatient({
          input: {
            id,
            // "" group will remove from current group according to docs
            user_group_id: groupId ?? '',
          },
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
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
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
    }
  },
}
