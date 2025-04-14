import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { SendCallInputSchema } from '../../api/schema'

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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const sendCallInput = SendCallInputSchema.parse({
      ...fields,
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

    await blandSdk.sendCall({
      ...sendCallInput,
      /**
       * A POST request will be made to this endpoint when the call ends
       *
       * [!!]
       * Currently only works with the sandbox environment but that's good enough for Workit bootcamp.
       * Todo: We need to ensure we grab the right base URL, depending on the environment.
       */
      webhook: `https://workit-cloud-functions-105158578148.us-central1.run.app/?activity_id=${payload.activity.id}`,
    })

    /**
     * Completion of the activity happens via a
     * Webhook to the endpoint provided in the `webhook` field.
     */
  },
}
