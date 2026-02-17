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
  onEvent: async ({ payload, onComplete, helpers: { log } }): Promise<void> => {
    const { fields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await blandSdk.stopActiveCall({
      call_id: fields.callId,
    })

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
  },
}
