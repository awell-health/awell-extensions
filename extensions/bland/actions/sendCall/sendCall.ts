import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { SendCallInputSchema } from '../../api/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const sendCall: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendCall',
  category: Category.COMMUNICATION,
  title: 'Send call',
  description: 'Send an AI phone call with a custom objective and actions.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, helpers: { log } }): Promise<void> => {
    const { fields: allFields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const getWebhookUrl = (): string | undefined => {
      if (
        allFields.completeExtensionActivityAsync &&
        allFields.webhook !== undefined
      ) {
        return `${allFields.webhook}?activity_id=${payload.activity.id}`
      }
      return undefined
    }

    const { otherData, ...fields } = allFields
    // otherData helps us to pass in fields that are not part of the SendCallInputSchema,
    // given bland's schema is updating quickly
    const sendCallInput = SendCallInputSchema.parse({
      ...fields,
      webhook: getWebhookUrl(),
      ...otherData, // there can be a 'webhook' field in this otherData object, it needs to be able to override the webhook from the fields object
      phone_number: fields.phoneNumber,
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

    try {
      log({ sendCallInput }, 'Sending call to Bland')
    } catch (err) {
      console.error('unable to use new helpers.log')
      console.error(JSON.stringify(err))
    }
    const { data } = await blandSdk.sendCall(sendCallInput)

    /**
     * If a webhook is provided, we don't need to complete the action
     * as the webhook will handle the completion
     */
    if (allFields.completeExtensionActivityAsync) {
      return
    }

    await onComplete({
      data_points: {
        call_id: data.call_id,
      },
      events: [
        addActivityEventLog({
          message: `Request for call sent to Bland.\nStatus: ${data.status}\nCall ID: ${data.call_id}\nMessage: ${data.message}`,
        }),
      ],
    })
  },
}
