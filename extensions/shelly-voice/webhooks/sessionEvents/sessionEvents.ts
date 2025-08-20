import { type Webhook } from '@awell-health/extensions-core'
import { dataPoints } from './config/dataPoints'

type Payload = Record<string, any>

export const sessionEvents: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'sessionEvents',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    try {
      const body = (payload as any)?.rawBody ?? {}
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
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { message: `Shelly Voice sessionEvents webhook error: ${(e as Error).message}` },
          },
        ],
      })
    }
  },
}
