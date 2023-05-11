import { type IncomingHttpHeaders } from 'http'
import { type WebhookPayload } from './WebhookPayload'
export interface OnWebhookReceivedParams<Payload> {
  payload: Payload
  rawBody: Buffer // for webhook validation
  headers: IncomingHttpHeaders // for webhook validation
  settings: Record<string, string>
}

export interface Webhook<DPKeys extends string, Payload> {
  key: string
  description?: string
  dataPoints: Record<DPKeys, any>
  onWebhookReceived: (
    params: OnWebhookReceivedParams<Payload>
  ) => Promise<WebhookPayload<DPKeys>>
}
