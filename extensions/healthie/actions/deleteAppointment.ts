import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../errors'
import {
  FieldType,
  type Action,
  type Field,
  Category,
} from '@awell-health/awell-extensions-types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description:
      'The id of the appointment in Healthie you would like to delete.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const deleteAppointment: Action<typeof fields, typeof settings> = {
  key: 'deleteAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Delete appointment',
  description: 'Delete an appointment in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id } = fields
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
        const { data } = await sdk.deleteAppointment({
          id,
        })

        if (!isNil(data.deleteAppointment?.messages)) {
          const errors = mapHealthieToActivityError(
            data.deleteAppointment?.messages
          )
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
