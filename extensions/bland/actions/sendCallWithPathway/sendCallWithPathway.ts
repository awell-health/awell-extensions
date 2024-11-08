import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const sendCallWithPathway: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendCallWithPathway',
  category: Category.COMMUNICATION,
  title: 'Send call with pathway',
  description: 'Send an AI phone call based on a pathway',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await blandSdk.sendCall({
      phone_number: fields.phoneNumber,
      pathway_id: fields.pathwayId,
      task: '',
    })

    await onComplete({
      data_points: {
        callId: data.call_id,
        status: data.status,
      },
      events: [
        addActivityEventLog({
          message: `Call sent to Bland. Status: ${data.status}, Call ID: ${data.call_id}`,
        }),
      ],
    })
  },
}
