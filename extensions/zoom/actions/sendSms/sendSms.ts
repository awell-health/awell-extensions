import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const sendSms: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendSms',
  category: Category.COMMUNICATION,
  title: 'Send SMS',
  description: 'Send an SMS',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, zoomSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await zoomSdk.sendSms({
      contact_center_number: fields.contactCenterNumber,
      consumer_numbers: [fields.to],
      body: fields.body,
    })

    await onComplete({
      data_points: {
        messageId: data[0].message_id,
        success: String(data[0].success),
      },
      events: [
        addActivityEventLog({
          message: `Success: ${String(data[0].success)}\nMessage ID: ${String(data[0].message_id)}\nDescription: ${String(data[0].description)}`,
        }),
      ],
    })
  },
}
