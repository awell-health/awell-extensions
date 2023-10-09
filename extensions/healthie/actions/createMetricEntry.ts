import { isNil } from 'lodash'
import { HealthieError, mapHealthieToActivityError } from '../errors'
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
  userId: {
    id: 'userId',
    label: 'User ID',
    description: 'The ID of the patient that this entry should be attached to.',
    type: FieldType.STRING,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies what kind of metric we are storing.',
    type: FieldType.STRING,
    required: true,
  },
  metricStat: {
    id: 'metricStat',
    label: 'Metric stat',
    description:
      'This is the actual data value for the metric. e.g if a patient weights 182 lbs, you would pass in 182 with a category of Weight',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const createMetricEntry: Action<typeof fields, typeof settings> = {
  key: 'createMetricEntry',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create metric entry',
  description: 'Create a metric entry for a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { userId, category, metricStat } = fields
    try {
      if (isNil(userId) || isNil(category) || isNil(metricStat)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`userId`, `category` or `metricStat` is missing',
              },
            },
          ],
        })
        return
      }
      const client = initialiseClient(settings)
      if (client != null) {
        const sdk = getSdk(client)
        await sdk.createEntry({
          metric_stat: metricStat,
          user_id: userId,
          type: 'MetricEntry',
          category,
        })
        await onComplete({})
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
