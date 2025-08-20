import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { createAgent } from '../../lib/livekitClient'

export const createAgentAction: Action<typeof fields, typeof settings, keyof typeof dataPoints> = {
  key: 'createAgent',
  title: 'Create Shelly Voice agent',
  description: 'Create a new LiveKit voice agent',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const f = FieldsValidationSchema.parse(payload.fields)
      const result = await createAgent({
        voice: f.voice,
        language: f.language,
        personality: f.personality,
      })
      await onComplete({
        data_points: {
          agentId: result.agentId,
          config: JSON.stringify(result.config),
          createdAt: new Date().toISOString(),
        },
      })
    } catch (e: any) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { message: `Shelly Voice createAgent error: ${(e as Error).message}` },
          },
        ],
      })
    }
  },
}
