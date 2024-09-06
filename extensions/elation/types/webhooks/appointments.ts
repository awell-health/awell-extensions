import z from 'zod'

/**
 * This is not the full payload, only the most interesting parts
 */
export const AppointmentsPayloadSchema = z.object({
  event_id: z.number(),
  application_id: z.string(),
  resource: z.string(),
  action: z.enum(['saved', 'deleted']),
  data: z.object({
    id: z.number(),
    scheduled_date: z.coerce.date(),
    duration: z.number(),
    reason: z.string(),
    mode: z.string(),
    patient: z.number(),
    physician: z.number(),
    practice: z.number(),
  }),
})
export type AppointmentsPayload = z.infer<typeof AppointmentsPayloadSchema>
