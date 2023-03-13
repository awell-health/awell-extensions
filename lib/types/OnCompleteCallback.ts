import { type ActivityEvent } from './ActivityEvent'

export type OnCompleteCallback<DPKeys extends string = string> = (params?: {
  events?: ActivityEvent[]
  data_points?: Partial<Record<DPKeys, string | null | undefined>>
}) => Promise<void>
