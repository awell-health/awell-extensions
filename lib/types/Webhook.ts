import { type IncomingHttpHeaders } from 'http'
import { type ActivityEvent } from './ActivityEvent'
import { type DataPointDefinition } from './DataPointDefinition'
import { type Settings } from './Settings'

export interface OnWebhookReceivedParams<Payload> {
  payload: Payload
  rawBody: Buffer // for webhook validation
  headers: IncomingHttpHeaders // for webhook validation
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

interface CallBackParams {
  response?: {
    statusCode: number
    message?: string
  }
  events?: ActivityEvent[]
}

export type OnWebhookSuccess<DPKeys extends string = string> = (
  params: CallBackParams & {
    data_points?: Partial<Record<DPKeys, string | null | undefined>>
    pathway_id?: string
    patient_id?: string
  }
) => Promise<void>

export type OnWebhookError = (params: CallBackParams) => Promise<void>

export interface WebhookPreProcessedPayload<Payload> {
  payload: Payload
  headers: string // will fix later
  settings: Settings
  pathwayId: string
  pluginId: string // i think this is extension key...
  inboundWebhookLogRequestId: string
}

export interface WebhookProcessedPayload<DPKeys extends string = string> {
  response: {
    statusCode: number
    message?: string
  },
  events?: ActivityEvent[]
  data_points?: Partial<Record<DPKeys, string | null | undefined>>
  inboundWebhookLogKey: string
}
