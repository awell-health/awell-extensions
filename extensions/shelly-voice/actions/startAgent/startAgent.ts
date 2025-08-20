import { Action, Category, validate } from '@awell-health/extensions-core'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { startAgent } from '../../lib/livekitClient'
import { SettingsValidationSchema } from '../../settings'

export const startAgentAction: Action<typeof FieldsValidationSchema, Record<string, unknown>> = {
  key: 'startAgent',
  title: 'Start Shelly Voice agent',
  description: 'Start a LiveKit voice agent session',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { fields: f, settings } = validate({
        schema: FieldsValidationSchema,
        payload,
        settingsSchema: SettingsValidationSchema,
      })
      const result = await startAgent(
        {
          livekitServerUrl: settings.livekitServerUrl,
          livekitApiKey: settings.livekitApiKey,
          livekitApiSecret: settings.livekitApiSecret,
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
      await onError({ events: [{ date: new Date().toISOString(), text: e.message }] })
    }
  },
}
