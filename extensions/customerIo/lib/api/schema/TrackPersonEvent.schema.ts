import z from 'zod'
import { ActionType, EventType } from './atoms'
import { optionalEmailSchema } from 'src/utils'

export const IdentifiersSchema = z
  .object({
    // Only one of these should be present
    id: z.string().optional(),
    email: optionalEmailSchema,
    cio_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure exactly one identifier is provided
      const count = [data.id, data.email, data.cio_id].filter(Boolean).length
      return count === 1
    },
    {
      message: 'Must provide exactly one of: id, email, or cio_id',
      path: ['identifiers'],
    },
  )

export const TrackPersonEventInputSchema = z.object({
  type: z.literal(EventType.Values.person),
  action: z.literal(ActionType.Values.event),
  identifiers: IdentifiersSchema,
  name: z.string().min(1),
  attributes: z.record(z.string(), z.string()).optional(),
})

export type TrackPersonEventInputType = z.infer<
  typeof TrackPersonEventInputSchema
>

export const TrackPersonEventResponseSchema = z.object({
  errors: z
    .array(
      z.object({
        reason: z.string(),
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
})

export type TrackPersonEventResponseType = z.infer<
  typeof TrackPersonEventResponseSchema
>
