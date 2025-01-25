import { z } from 'zod'

export const PeriodSchema = z.object({
  id: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})
