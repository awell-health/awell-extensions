import { Action, Category, validate } from '@awell-health/extensions-core'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { createAgent } from '../../lib/livekitClient'

export const createAgentAction: Action<typeof FieldsValidationSchema, Record<string, unknown>> = {
  key: 'createAgent',
  title: 'Create Shelly Voice agent',
  description: 'Create a new LiveKit voice agent',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { fields: f } = validate({
        schema: FieldsValidationSchema,
        payload,
      })
      const result = await createAgent({
        voice: f.voice,
        language: f.language,
        personality: f.personality,
      })
      await onComplete({
        data_points: {
          agentId: result.agentId,
          config: result.config,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (e: any) {
      await onError({ events: [{ date: new Date().toISOString(), text: e.message }] })
    }
  },
}
