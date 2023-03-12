import { type DataPointDefinition } from './DataPointDefinition'
import { type WebhookPayload } from './WebhookPayload'

export interface Webhook<DPKeys extends string, Payload> {
  key: string
  description?: string
  dataPoints: Record<DPKeys, DataPointDefinition>
  onWebhookReceived: (payload: Payload) => Promise<WebhookPayload<DPKeys>>
}
