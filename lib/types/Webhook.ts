import { type ActivityEvent } from './ActivityEvent'
import { type DataPointDefinition } from './DataPointDefinition'
import { type Settings } from './Settings'

export interface OnWebhookReceivedParams<Payload> {
  payload: Payload
  rawBody: Buffer
  headers: Record<string, string>
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
  statusCode: number
  data_points?: Partial<Record<DPKeys, string | null | undefined>>
  events?: ActivityEvent[]
}) => Promise<void>

export type OnWebhookError = (params: {
  statusCode: number
  events?: ActivityEvent
}) => Promise<void>
