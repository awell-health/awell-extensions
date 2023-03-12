import { type DataPointDefinition } from './DataPointDefinition'

export interface Webhook<DPKeys extends string, Payload> {
  key: string
  description?: string
  dataPoints: Record<DPKeys, DataPointDefinition>
  onWebhookReceived: (payload: Payload) => Promise<Record<DPKeys, string>>
}
