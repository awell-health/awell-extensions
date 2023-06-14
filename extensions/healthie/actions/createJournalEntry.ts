import { isNil } from 'lodash'
import { HealthieError, mapHealthieToActivityError } from '../errors'
import {
  type DataPointDefinition,
  type Action,
  type Field,
  FieldType,
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
  type: {
    id: 'type',
    label: 'Type',
    description:
      'The type of entry. Valid options are: ["MetricEntry", "FoodEntry", "WorkoutEntry", "MirrorEntry", "SleepEntry", "NoteEntry", "WaterIntakeEntry", "PoopEntry", "SymptomEntry"].',
    type: FieldType.STRING,
    required: true,
  },
  percieved_hungriness: {
    id: 'percieved_hungriness',
    label: 'Perceived hungriness',
    description:
      'A string index of hungriness. Valid options are: ["1", "2", "3"].',
    type: FieldType.NUMERIC,
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
  category: Category.EHR_INTEGRATIONS,
  title: 'Create journal entry',
  description: 'Create a journal entry in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, type, percieved_hungriness } = fields
    try {
      if (isNil(id) || isNil(type)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` or `type` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createJournalEntry({
          input: {
            user_id: id,
            type,
            percieved_hungriness: String(percieved_hungriness),
          },
        })

        const journalEntryId = data.createEntry?.entry?.id

        await onComplete({
          data_points: {
            journalEntryId,
          },
        })
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
