import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const stopActiveCall: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'stopActiveCall',
  category: Category.COMMUNICATION,
  title: 'Stop active call',
  description: 'End an active phone call by call ID.',
  fields,
  previewable: false,
  dataPoints,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing stopActiveCall')

    try {
      const { fields, blandSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const stopActiveCallInput = {
        call_id: fields.callId,
      }

      helpers.log(
        { meta, stopActiveCallInput },
        'Stopping active call via Bland',
      )
      const { data } = await blandSdk.stopActiveCall(stopActiveCallInput)

      await onComplete({
        data_points: {
          status: data.status,
          message: data.message,
        },
        events: [
          addActivityEventLog({
            message: `Stop call request sent to Bland.\nStatus: ${data.status}\nMessage: ${data.message}`,
          }),
        ],
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
