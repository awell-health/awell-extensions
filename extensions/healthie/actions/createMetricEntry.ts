import { HealthieError, mapHealthieToActivityError } from '../errors'
import {
  FieldType,
  validate,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { settingsValidationSchema, type settings } from '../settings'
import { z, ZodError, type ZodTypeAny } from 'zod'
import { fromZodError } from 'zod-validation-error'

const fields = {
  userId: {
    id: 'userId',
    label: 'User ID',
    description: 'The ID of the patient that this entry should be attached to',
    type: FieldType.STRING,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies what kind of metric we are storing',
    type: FieldType.STRING,
    required: true,
  },
  metricStat: {
    id: 'metricStat',
    label: 'Metric stat',
    description: 'The actual data value for the metric',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  category: z.string().nonempty(),
  metricStat: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const createMetricEntry: Action<typeof fields, typeof settings> = {
  key: 'createMetricEntry',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create metric entry',
  description: 'Create a metric entry for a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings,
        fields: { userId, category, metricStat },
      } = validate({
        schema: z.object({
          settings: settingsValidationSchema,
          fields: fieldsValidationSchema,
        }),
        payload,
      })

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
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof HealthieError) {
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
