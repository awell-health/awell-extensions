import { type ActivityEvent } from './ActivityEvent'
import { type Settings } from './Settings'

export type OnWebhookComplete<DPKeys extends string> = (params?: {
  pathway_id?: string
  patient_id?: string
  data_points?: Record<DPKeys, string>
  events?: ActivityEvent[]
}) => Promise<void>

export interface WebhookPreProcessedPayload {
  payload: Buffer
  headers: string // will fix later
  settings: Settings
  pathwayId: string
  pluginId: string // i think this is extension key...
  inboundWebhookLogRequestId: string
}
