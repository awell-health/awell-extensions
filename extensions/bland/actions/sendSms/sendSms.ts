import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { SendSmsInputSchema } from '../../api/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const sendSms: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendSms',
  category: Category.COMMUNICATION,
  title: 'Send SMS',
  description:
    'Send an SMS message immediately. The agent message is optional when a pathway drives the conversation.',
  fields,
  previewable: true,
  dataPoints,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, helpers: { log } }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const { fields, blandSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const getWebhookUrl = (): string | undefined => {
      if (isEmpty(fields.webhook)) return undefined
      const separator = fields.webhook?.includes('?') === true ? '&' : '?'
      return `${fields.webhook as string}${separator}activity_id=${payload.activity.id}`
    }

    const sendSmsInput = SendSmsInputSchema.parse({
      user_number: fields.userNumber,
      agent_number: fields.agentNumber,
      agent_message: isEmpty(fields.agentMessage)
        ? undefined
        : fields.agentMessage,
      pathway_id: isEmpty(fields.pathwayId) ? undefined : fields.pathwayId,
      new_conversation: fields.newConversation,
      webhook: getWebhookUrl(),
      time_out: fields.timeOut,
      timeout_message: isEmpty(fields.timeoutMessage)
        ? undefined
        : fields.timeoutMessage,
      warning_time: fields.warningTime,
      warning_message: isEmpty(fields.warningMessage)
        ? undefined
        : fields.warningMessage,
      request_data: isEmpty(fields.requestData)
        ? undefined
        : fields.requestData,
      metadata: {
        ...fields.metadata,
        awell_patient_id: payload.patient.id,
        awell_care_flow_definition_id: payload.pathway.definition_id,
        awell_care_flow_id: payload.pathway.id,
        awell_activity_id: payload.activity.id,
      },
    })

    try {
      log({ meta, sendSmsInput }, 'Sending SMS via Bland')
    } catch (err) {
      console.error('unable to use new helpers.log')
      console.error(JSON.stringify(err))
    }

    const { data } = await blandSdk.sendSms(sendSmsInput)

    const conversationId = data?.data?.conversation_id

    await onComplete({
      data_points: {
        conversationId: isNil(conversationId) ? undefined : conversationId,
        smsResponse: isNil(data) ? undefined : JSON.stringify(data),
      },
      events: [
        addActivityEventLog({
          message: `SMS request sent to Bland.\nConversation ID: ${
            conversationId ?? 'n/a'
          }`,
        }),
      ],
    })
  },
}
