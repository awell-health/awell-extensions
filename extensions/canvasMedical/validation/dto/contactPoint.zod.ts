import { z } from 'zod'
import { periodSchema } from './period.zod'

export const contactPointSchema = z.object({
  system: z.enum(['phone', 'email', 'sms', 'url', 'fax', 'pager', 'other']),
  value: z.string(),
  use: z.enum(['home', 'work', 'temp', 'old', 'mobile']),
  rank: z.number().min(1).int(),
  period: z.array(periodSchema),
})
