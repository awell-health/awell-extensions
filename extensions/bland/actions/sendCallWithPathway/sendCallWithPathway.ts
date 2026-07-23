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
  previewable: true,
  dataPoints,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing sendCallWithPathway',
    )

    try {
      const { fields: allFields, blandSdk } = await validatePayloadAndCreateSdk(
        {
          fieldsSchema: FieldsValidationSchema,
          payload,
        },
      )

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

      // TEMPORARY: remap a specific pathway_id to a new one. Remove once the
      // upstream caller is updated to send the new id directly.
      const PATHWAY_ID_OVERRIDES: Record<string, string> = {
        '5c7b1835-63e6-4a3a-a60c-7f30b9cb7244':
          '23b4bee6-0fba-4d1c-b719-1248c400a2e7',
      }
      const resolvedPathwayId =
        PATHWAY_ID_OVERRIDES[fields.pathwayId] ?? fields.pathwayId
      if (resolvedPathwayId !== fields.pathwayId) {
        helpers.log(
          {
            meta,
            originalPathwayId: fields.pathwayId,
            resolvedPathwayId,
          },
          'Applied temporary pathway_id override',
        )
      }

      const sendCallInput = SendCallInputSchema.parse({
        ...fields,
        webhook: getWebhookUrl(),
        ...otherData, // there was a 'webhook' field in this otherData object
        phone_number: fields.phoneNumber,
        pathway_id: resolvedPathwayId,
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

      // TODO: remove this once we validate helpers.log in production
      try {
        helpers.log({ meta, sendCallInput }, 'Sending call to Bland')
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
            message: `Request for call with pathway sent to Bland.\nStatus: ${data.status}\nCall ID: ${data.call_id}\nMessage: ${data.message}`,
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
