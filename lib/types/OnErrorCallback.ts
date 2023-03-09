import { type ActivityEvent } from './ActivityEvent'

export type OnErrorCallback = (params?: {
  events?: ActivityEvent[]
}) => Promise<void>
