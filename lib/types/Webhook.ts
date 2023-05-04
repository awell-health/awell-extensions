import { type ActivityEvent } from './ActivityEvent'
import { type DataPointDefinition } from './DataPointDefinition'
import { type Settings } from './Settings'

export interface OnWebhookReceivedParams<Payload> {
  payload: Payload
  rawBody: Buffer // for webhook validation
  headers: Record<string, string> // for webhook validation
  settings: Settings
}

export interface Webhook<DPKeys extends string, Payload> {
  key: string
  description?: string
  dataPoints: Record<DPKeys, DataPointDefinition>
  onWebhookReceived: (
    payload: OnWebhookReceivedParams<Payload>,
    onSuccess: OnWebhookSuccess<DPKeys>,
    onError: OnWebhookError
  ) => Promise<void>
}

export type OnWebhookSuccess<DPKeys extends string = string> = (params?: {
  response: {
    statusCode: number
    message?: string
  }
  data_points?: Partial<Record<DPKeys, string | null | undefined>>
  events?: ActivityEvent[]
}) => Promise<void>

export type OnWebhookError = (params: {
  response: {
    statusCode: number
    message?: string
  }
  events?: ActivityEvent
}) => Promise<void>

export interface WebhookProcessedPayload<DPKeys extends string = string> {
  response: {
    statusCode: number
    message?: string
  }
  data_points?: Partial<Record<DPKeys, string | null | undefined>>
  inboundWebhookLogKey: string
}
