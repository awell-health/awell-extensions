import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { SendCallInputSchema } from '../../api/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

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
    const { fields: allFields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })
    const { otherData, ...fields } = allFields
    const sendCallInput = SendCallInputSchema.parse({
      ...otherData,
      ...fields,
      phone_number: fields.phoneNumber,
      pathway_id: fields.pathwayId,
      request_data: fields.requestData,
      metadata: {
        ...fields.metadata,
        awell_patient_id: payload.patient.id,
        awell_care_flow_definition_id: payload.pathway.definition_id,
        awell_care_flow_id: payload.pathway.id,
        awell_activity_id: payload.activity.id,
      },
      analysis_schema: fields.analysisSchema,
    })

    const { data } = await blandSdk.sendCall({
      ...sendCallInput,
    })

    await onComplete({
      data_points: {
        call_id: data.call_id,
      },
      events: [
        addActivityEventLog({
          message: `Request for call with pathway sent to Bland.\nStatus: ${data.status}\nCall ID: ${data.call_id}\nMessage: ${data.message}`,
        }),
      ],
    })
  },
}
