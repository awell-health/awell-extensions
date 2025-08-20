import { Webhook } from '@awell-health/extensions-core'
import { dataPoints } from './config/dataPoints'

export const sessionEvents: Webhook = {
  key: 'sessionEvents',
  dataPoints,
  onEvent: async ({ payload, onSuccess, onError }) => {
    try {
      const body = payload.rawBody ?? {}
      const eventType = (body as any).eventType ?? 'unknown'
      const sessionId = (body as any).sessionId ?? ''
      const agentId = (body as any).agentId ?? ''
      const timestamp = (body as any).timestamp ?? new Date().toISOString()
      const details = body
      await onSuccess({
        data_points: {
          eventType,
          sessionId,
          agentId,
          timestamp,
          details,
        },
      })
    } catch (e: any) {
      await onError({ events: [{ date: new Date().toISOString(), text: e.message }] })
    }
  },
}
