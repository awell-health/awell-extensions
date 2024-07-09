import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { CreateFlowExecutionSchema, fields, dataPoints } from './config'
import { isNil } from 'lodash'

export const createFlowExecution: Action<typeof fields, typeof settings> = {
  key: 'createFlowExecution',
  title: 'Start a new execution of a pre-existing flow',
  description:
    'Send a text message from a given telephone number to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      settings: { accountSid, authToken },
      fields: { recipient, parameters, from, flow_id },
    } = validate({
      schema: CreateFlowExecutionSchema,
      payload,
    })

    // TODO: get rid of this assertion
    if (isNil(from)) {
      throw new Error('`from` should never be invalid')
    }

    const client = twilioSdk(accountSid, authToken, {
      accountSid,
    })

    const execution = await client.studio.flows(flow_id).executions.create({
      to: recipient,
      from,
      parameters,
    })

    await onComplete({
      data_points: {
        executionId: execution.sid,
      },
    })
  },
}
