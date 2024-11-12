import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
// import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
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

    const metaData = {
      awell_patient_id: payload.patient.id,
      awell_care_flow_definition_id: payload.pathway.definition_id,
      awell_care_flow_id: payload.pathway.id,
      awell_activity_id: payload.activity.id,
    }

    const { data } = await blandSdk.sendCall({
      phone_number: fields.phoneNumber,
      pathway_id: fields.pathwayId,
      task: '',
      /**
       * A POST request will be made to this endpoint when the call ends
       *
       * [!!]
       * Currently only works with the sandbox environment but that's good enough for Workit bootcamp.
       * Todo: We need to ensure we grab the right base URL, depending on the environment.
       */
      webhook: `https://workit-cloud-functions-105158578148.us-central1.run.app/?activity_id=${payload.activity.id}`,
      request_data: fields.requestData,
      metadata: metaData,
      analysis_schema: fields.analysisSchema,
    })

    console.log('Bland call details', {
      awell_activity_id: metaData.awell_activity_id,
      ...data,
    })

    /**
     * Completion of the activity happens via a
     * Webhook to the endpoint provided in the `webhook` field.
     *
     * In an ideal world, we have an additional method like `await onWait({events...})`
     * that we can use to push some logs to the activity's timeline without completing or erroring the activity.
     * We can use this to log the call status and call ID which we receive immediately from Bland when we make the request.
     */
    // await onComplete({
    //   data_points: {
    //     callId: data.call_id,
    //     status: data.status,
    //   },
    //   events: [
    //     addActivityEventLog({
    //       message: `Call sent to Bland. Status: ${data.status}, Call ID: ${data.call_id}, Message: ${data.message}.`,
    //     }),
    //   ],
    // })
  },
}
