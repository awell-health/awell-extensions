import { type IncomingHttpHeaders } from 'http'
import { type ActivityEvent } from './ActivityEvent'
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
    payload: OnWebhookReceivedParams<Payload>,
    onSuccess: OnWebhookSuccess<DPKeys>,
    onError: OnWebhookError
  ) => Promise<void>
}

interface CallBackParams {
  response?: {
    statusCode: number
    message?: string
  }
  events?: ActivityEvent[]
}

export type OnWebhookSuccess<DPKeys extends string = string> = (
  params: CallBackParams & WebhookPayload<DPKeys>
) => Promise<void>

export type OnWebhookError = (params: CallBackParams) => Promise<void>
