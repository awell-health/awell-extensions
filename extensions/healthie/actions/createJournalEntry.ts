import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../../../lib/errors'
import {
  type DataPointDefinition,
  type Action,
  type Field,
  FieldType,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'


const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  journalEntryId: {
    key: 'journalEntryId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createJournalEntry: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createJournalEntry',
  category: Category.INTEGRATIONS,
  title: 'Create journal entry',
  description: 'Create journal entry in Healthie.',
  fields,
  dataPoints,
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
        return;
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createJournalEntry({
          input: {
            user_id: id
          }
        })

        if (!isNil(data.createEntry?.messages)) {
          const errors = mapHealthieToActivityError(data.createEntry?.messages)
          await onError({
            events: errors,
          })
          return
        }

        const journalEntryId = data.createEntry?.entry?.id;

        await onComplete(
          {
            data_points: {
              journalEntryId
            }
          }
        )
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