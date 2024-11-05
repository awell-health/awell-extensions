import { z } from 'zod'

export const messageThreadSchema = z.object({
  patient: z.number().int().positive(),
  practice: z.number().int().positive(),
  is_urgent: z.boolean().optional(),
  messages: z.array(
    z.object({
      body: z.string().min(1, 'Message body is required'),
    })
  ),
})
