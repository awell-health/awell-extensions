import { Action, Category, validate } from '@awell-health/extensions-core'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints } from './config/dataPoints'
import { stopAgent } from '../../lib/livekitClient'
import { SettingsValidationSchema } from '../../settings'

export const stopAgentAction: Action<typeof FieldsValidationSchema, Record<string, unknown>> = {
  key: 'stopAgent',
  title: 'Stop Shelly Voice agent',
  description: 'Stop a LiveKit voice agent session',
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
      const result = await stopAgent(
        {
          livekitServerUrl: settings.livekitServerUrl,
          livekitApiKey: settings.livekitApiKey,
          livekitApiSecret: settings.livekitApiSecret,
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
      await onError({ events: [{ date: new Date().toISOString(), text: e.message }] })
    }
  },
}
