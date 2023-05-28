import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../errors'
import {
  FieldType,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const archivePatient: Action<typeof fields, typeof settings> = {
  key: 'archivePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Archive patient',
  description: 'Archive a patient in Healthie.',
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
        const { data } = await sdk.updatePatient({
          input: {
            id,
            active: false,
          },
        })

        if (!isNil(data.updateClient?.messages)) {
          const errors = mapHealthieToActivityError(data.updateClient?.messages)
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
