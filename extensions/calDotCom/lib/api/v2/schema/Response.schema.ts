import { z } from 'zod'

export const BaseResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  error: z.record(z.string(), z.unknown()).optional(),
})

export type BaseResponseType = z.infer<typeof BaseResponseSchema>
