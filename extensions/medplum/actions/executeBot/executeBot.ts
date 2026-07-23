import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

export const executeBot: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'executeBot',
  category: Category.EHR_INTEGRATIONS,
  title: 'Execute Bot',
  description: 'Execute a Medplum Bot',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing executeBot')

    try {
      const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const res = await medplumSdk.executeBot(
        input.botId,
        input.body,
        'application/json',
      )

      await onComplete({
        data_points: {
          data: JSON.stringify(res),
          jsonData: JSON.stringify(res),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
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
