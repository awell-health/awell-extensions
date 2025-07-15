import { z } from 'zod'
import { LeadSchema } from './atoms'

export const GetLeadResponseSchema = z.object({
  lead: LeadSchema,
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type GetLeadResponseType = z.infer<typeof GetLeadResponseSchema>
