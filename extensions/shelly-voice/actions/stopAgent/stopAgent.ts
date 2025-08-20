import { type Action, Category } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { stopAgent } from '../../lib/livekitClient'

export const stopAgentAction: Action<typeof fields, typeof settings, keyof typeof dataPoints> = {
  key: 'stopAgent',
  title: 'Stop Shelly Voice agent',
  description: 'Stop a LiveKit voice agent session',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const f = FieldsValidationSchema.parse(payload.fields)
      const s = SettingsValidationSchema.parse(payload.settings)
      const result = await stopAgent(
        {
          livekitServerUrl: s.livekitServerUrl,
          livekitApiKey: s.livekitApiKey,
          livekitApiSecret: s.livekitApiSecret,
        },
        f.agentId
      )
      await onComplete({
        data_points: {
          status: result.status,
          stoppedAt: new Date().toISOString(),
        },
      })
    } catch (e: any) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { message: `Shelly Voice stopAgent error: ${(e as Error).message}` },
          },
        ],
      })
    }
  },
}
