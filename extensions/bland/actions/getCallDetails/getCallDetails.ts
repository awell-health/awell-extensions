import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const getCallDetails: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getCallDetails',
  category: Category.COMMUNICATION,
  title: 'Get call details',
  description:
    'Retrieve detailed information, metadata and transcripts for a call.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await blandSdk.getCallDetails({
      call_id: fields.callId,
    })

    await onComplete({
      data_points: {
        callData:
          isEmpty(data) || isNil(data) ? undefined : JSON.stringify(data),
      },
      events: [
        addActivityEventLog({
          message: 'Call details:\n' + JSON.stringify(data, null, 2),
        }),
      ],
    })
  },
}
