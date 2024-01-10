import { eventCreated } from './eventCreated'
import { eventCanceled } from './eventCanceled'
export type { EventCreated } from './eventCreated'
export type { EventCanceled } from './eventCanceled'

export const webhooks = [eventCreated, eventCanceled]
