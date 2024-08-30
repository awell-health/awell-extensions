import z from 'zod'
import { EventType } from './EventType'

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  customAttributes: z.record(z.string(), z.any()),
})

export const EventPayloadSchema = z.object({
  eventType: z.nativeEnum(EventType),
  id: z.string().optional(), // Optional since it's content events only
  timestamp: z.number().int().positive(),
  user: UserSchema,
})
export type EventPayload = z.infer<typeof EventPayloadSchema>
