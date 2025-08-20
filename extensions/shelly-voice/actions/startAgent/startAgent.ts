import { type Action, Category } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { startAgent } from '../../lib/livekitClient'

export const startAgentAction: Action<typeof fields, typeof settings, keyof typeof dataPoints> = {
  key: 'startAgent',
  title: 'Start Shelly Voice agent',
  description: 'Start a LiveKit voice agent session',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const f = FieldsValidationSchema.parse(payload.fields)
      const s = SettingsValidationSchema.parse(payload.settings)
      const result = await startAgent(
        {
          livekitServerUrl: s.livekitServerUrl,
          livekitApiKey: s.livekitApiKey,
          livekitApiSecret: s.livekitApiSecret,
        },
        f.agentId,
        {
          pathwayId: payload.pathway?.id,
          activityId: payload.activity?.id,
          patientId: payload.patient?.id,
          sessionContext: f.sessionContext,
        }
      )
      await onComplete({
        data_points: {
          sessionId: result.sessionId,
          status: result.status,
          startedAt: new Date().toISOString(),
        },
      })
    } catch (e: any) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { message: `Shelly Voice startAgent error: ${(e as Error).message}` },
          },
        ],
      })
    }
  },
}
