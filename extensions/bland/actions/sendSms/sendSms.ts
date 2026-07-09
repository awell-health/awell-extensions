import { type Action, Category } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { SendSmsInputSchema } from '../../api/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { mapBlandErrorToActivityEvent } from '../../lib/errors'

export const sendSms: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendSms',
  category: Category.COMMUNICATION,
  title: 'Send SMS',
  description:
    'Send an SMS message from an agent to a user, creating or resuming a conversation.',
  fields,
  previewable: true,
  dataPoints,
  supports_automated_retries: true,
  onEvent: async ({
    payload,
    onComplete,
    onError,
    helpers: { log },
  }): Promise<void> => {
    const { fields: allFields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { otherData, ...input } = allFields

    // Only forward optional JSON/array overrides when the user actually
    // provided a value — empty objects/arrays should not override the
    // configuration already set on the SMS number.
    const omitEmpty = <T>(value: T | undefined): T | undefined =>
      isNil(value) || isEmpty(value) ? undefined : value

    const sendSmsInput = SendSmsInputSchema.parse({
      ...input,
      // otherData escape hatch first, then explicit fields take precedence
      ...otherData,
      to: input.to,
      agent_number: input.agentNumber,
      text: input.text,
      new_conversation: input.newConversation,
      persona_id: input.personaId,
      persona_version: input.personaVersion,
      persona_settings: omitEmpty(input.personaSettings),
      pathway_id: input.pathwayId,
      pathway_version: input.pathwayVersion,
      start_node_id: input.startNodeId,
      webhook: input.webhook,
      request_data: {
        ...input.requestData,
        awell_patient_id: payload.patient.id,
        awell_care_flow_definition_id: payload.pathway.definition_id,
        awell_care_flow_id: payload.pathway.id,
        awell_activity_id: payload.activity.id,
      },
      metadata: omitEmpty(input.metadata),
      outcome_ids: omitEmpty(input.outcomeIds),
      citation_schema_ids: omitEmpty(input.citationSchemaIds),
      channel: input.channel,
      content_sid: input.contentSid,
      content_variables: omitEmpty(input.contentVariables),
      time_out: input.timeOut,
      timeout_message: input.timeoutMessage,
      warning_time: input.warningTime,
      warning_message: input.warningMessage,
    })

    try {
      log({ sendSmsInput }, 'Sending SMS via Bland')
    } catch (err) {
      console.error('unable to use new helpers.log')
      console.error(JSON.stringify(err))
    }

    let responseBody
    try {
      const response = await blandSdk.sendSms(
        sendSmsInput,
        // Idempotency key keeps automated retries from double-sending.
        payload.activity.id
      )
      responseBody = response.data
    } catch (err) {
      // Map known Bland/Axios HTTP errors (e.g. 403 ENTERPRISE_REQUIRED) to the
      // right category. 4xx -> BAD_REQUEST (non-retryable), 5xx/network ->
      // SERVER_ERROR (retryable). Anything unknown is re-thrown.
      const event = mapBlandErrorToActivityEvent(err)
      if (event === undefined) {
        throw err
      }
      await onError({ events: [event] })
      return
    }

    if (!isNil(responseBody.errors) && !isEmpty(responseBody.errors)) {
      const message = JSON.stringify(responseBody.errors)
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Bland rejected the SMS send request: ${message}` },
            error: {
              category: 'BAD_REQUEST',
              message,
            },
          },
        ],
      })
      return
    }

    const data = responseBody.data

    await onComplete({
      data_points: {
        conversationId: data?.conversation_id,
        workflowId: data?.workflow_id,
        messageId: data?.message_id,
        message: data?.message,
      },
      events: [
        addActivityEventLog({
          message: `SMS sent via Bland.\nConversation ID: ${
            data?.conversation_id ?? 'n/a'
          }\nWorkflow ID: ${data?.workflow_id ?? 'n/a'}\nMessage: ${
            data?.message ?? 'n/a'
          }`,
        }),
      ],
    })
  },
}
