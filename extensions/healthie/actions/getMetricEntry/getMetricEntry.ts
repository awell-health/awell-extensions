import { ZodError, z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { dataPoints, fields, FieldsValidationSchema } from './config'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { isEmpty } from 'lodash'

export const getMetricEntry: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getMetricEntry',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get metric entry',
  description:
    'Get most recent metric entry of a given category from Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings,
        fields: { patientId, category },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = initialiseClient(settings)
      if (client != null) {
        const sdk = getSdk(client)
        const { data } = await sdk.entries({
          type: 'MetricEntry',
          category,
          client_id: patientId,
        })

        const mostRecentMetricObject =
          data.entries === undefined || data.entries?.length === 0
            ? undefined
            : data.entries?.[0]

        await onComplete({
          data_points: {
            metricId: mostRecentMetricObject?.id,
            metricValue: isEmpty(mostRecentMetricObject)
              ? undefined
              : String(mostRecentMetricObject?.metric_stat),
            createdAt: isEmpty(mostRecentMetricObject)
              ? undefined
              : new Date(
                  mostRecentMetricObject?.created_at ?? ''
                ).toISOString(),
          },
        })
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
