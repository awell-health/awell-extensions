import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const triggerFlow: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'triggerFlow',
  category: Category.COMMUNICATION,
  title: 'Trigger flow',
  description: 'Trigger a flow in Talkdesk',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing triggerFlow')

    try {
      const { fields, client } = await validatePayloadAndCreateClient({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })
      const { activity } = payload
      const input = {
        flowId: fields.flowId,
        data: { ...fields.data, awell_activity_id: activity.id },
      }

      const res = await client.triggerFlow(input)

      if (fields.autoComplete) {
        await onComplete({
          data_points: {
            interactionId: res.interaction_id,
            flowVersionId: res.flow_version_id,
          },
          events: [
            addActivityEventLog({
              message: `Flow started in TalkDesk. Interaction ID: ${res.interaction_id}, Flow version ID: ${res.flow_version_id}.`,
            }),
          ],
        })
      }
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
