import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { randomUUID } from 'crypto'
import { isEmpty, isNil } from 'lodash'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { CreateSmsConversationInputSchema } from '../../api/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const createSmsConversation: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createSmsConversation',
  category: Category.COMMUNICATION,
  title: 'Create SMS conversation',
  description:
    'Create an SMS conversation seeded with pathway state, without sending a message immediately. The pathway then drives outbound texts.',
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

    const createSmsConversationInput = CreateSmsConversationInputSchema.parse({
      user_number: fields.userNumber,
      agent_number: fields.agentNumber,
      message: fields.message,
      // Required by the live Bland API despite being documented as optional;
      // it is only a correlation id so a generated UUID is sufficient.
      message_sid: randomUUID(),
      sender: fields.sender,
      curr_pathway_id: isEmpty(fields.currPathwayId)
        ? undefined
        : fields.currPathwayId,
      curr_pathway_version: isEmpty(fields.currPathwayVersion)
        ? undefined
        : fields.currPathwayVersion,
      current_node_id: isEmpty(fields.currentNodeId)
        ? undefined
        : fields.currentNodeId,
      new_conversation: fields.newConversation,
      request_data: isEmpty(fields.requestData)
        ? undefined
        : fields.requestData,
    })

    try {
      log(
        { meta, createSmsConversationInput },
        'Creating SMS conversation via Bland',
      )
    } catch (err) {
      console.error('unable to use new helpers.log')
      console.error(JSON.stringify(err))
    }

    const { data } = await blandSdk.createSmsConversation(
      createSmsConversationInput,
    )

    const conversationId = data?.data?.conversation_id

    await onComplete({
      data_points: {
        conversationId: isNil(conversationId) ? undefined : conversationId,
        createResponse: isNil(data) ? undefined : JSON.stringify(data),
      },
      events: [
        addActivityEventLog({
          message: `SMS conversation created in Bland.\nConversation ID: ${
            conversationId ?? 'n/a'
          }`,
        }),
      ],
    })
  },
}
