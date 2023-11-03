import { eventCreated } from './eventCreated'
import { eventCanceled } from './eventCanceled'
import { eventRescheduled } from './eventRescheduled'
export type { EventCreated } from './eventCreated'
export type { EventCanceled } from './eventCanceled'
export type { EventRescheduled } from './eventRescheduled'

export const webhooks = [eventCreated, eventCanceled, eventRescheduled]
