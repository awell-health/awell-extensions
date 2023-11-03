import { eventCreated } from './eventCreated'
import { eventCanceled } from './eventCancelled'
export type { EventCreated } from './eventCreated'
export type { EventCanceled } from './eventCancelled'

export const webhooks = [eventCreated, eventCanceled]
