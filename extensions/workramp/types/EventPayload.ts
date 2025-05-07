import z from 'zod'
import { EventType } from './EventType'
import { optionalEmailSchema } from '../../../src/utils/emailValidation'
const UserSchema = z.object({
  id: z.string(),
  email: optionalEmailSchema,
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
