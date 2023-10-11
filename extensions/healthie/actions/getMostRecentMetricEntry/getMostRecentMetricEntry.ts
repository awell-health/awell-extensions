import { ZodError, z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings, settingsValidationSchema } from '../../settings'
import { HealthieError, mapHealthieToActivityError } from '../../errors'
import { dataPoints, fields, fieldsValidationSchema } from './config'
import { initialiseClient } from '../../graphqlClient'
import { getSdk } from '../../gql/sdk'

export const getMostRecentMetricEntry: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getMostRecentMetricEntry',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get most recent metric entry',
  description: 'Get most recent metric entry in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings,
        fields: { category },
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
        const { data } = await sdk.entries({ type: 'MetricEntry', category })
        await onComplete({
          data_points: {
            lastMetricValue:
              data.entries === undefined || data.entries?.length === 0
                ? undefined
                : JSON.stringify(data.entries?.[0]),
          },
        })
      }
    } catch (err) {
      console.log(err)
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
