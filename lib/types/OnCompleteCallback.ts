import { type ActivityEvent } from './ActivityEvent'

export type OnCompleteCallback = (params?: {
  events?: ActivityEvent[]
}) => Promise<void>
