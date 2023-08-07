import { z } from 'zod'
import { periodSchema } from './period.zod'
import { codeSchema } from './coding.zod'

export const identifierSchema = z.object({
  system: z.string(),
  value: z.string(),
  use: z.enum(['usual', 'official', 'secondary', 'temp', 'old']),
  period: z.array(periodSchema).optional(),
  type: z
    .object({
      coding: z.array(codeSchema),
    })
    .optional(),
  assigner: z
    .object({
      display: z.string(),
    })
    .optional(),
})
