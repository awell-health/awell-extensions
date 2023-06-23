import { z } from 'zod'
import { periodSchema } from './period.zod'

export const identifierSchema = z.object({
  system: z.string(),
  value: z.string(),
  use: z.enum(['usual', 'official', 'secondary', 'temp', 'old']),
  period: z.array(periodSchema),
})
