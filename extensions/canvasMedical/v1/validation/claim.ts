import { DateOnlySchema } from '@awell-health/extensions-core'
import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'

export const claimSchema = z.object({
  resourceType: z.literal('Claim'),
  status: z.string(),
  type: z.record(z.string(), z.any()),
  use: z.string(),
  patient: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  created: DateOnlySchema,
  priority: z.record(z.string(), z.any()).optional(),
  provider: z.record(z.string(), z.any()),
  supportingInfo: z.array(z.any()).optional(),
  diagnosis: z.array(z.record(z.string(), z.any())),
  insurance: z.array(z.record(z.string(), z.any())),
  item: z.array(z.record(z.string(), z.any())),
})

export type Claim = z.infer<typeof claimSchema>
