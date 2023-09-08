import { DateOnlySchema } from '@awell-health/extensions-core'
import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'

export const coverageSchema = z.object({
  resourceType: z.literal('Coverage'),
  order: z.number(),
  status: z.string(),
  type: z.record(z.string(), z.any()).optional(),
  subscriber: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  subscriberId: z.string().optional(),
  beneficiary: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  relationship: z.record(z.string(), z.any()),
  period: z.object({
    start: DateOnlySchema,
    end: DateOnlySchema.optional(),
  }),
  payor: z.array(z.record(z.string(), z.any())),
  class: z.array(z.record(z.string(), z.any())).optional(),
})

export const coverageWithIdSchema = coverageSchema.extend({
  id: z.string(),
})

export type Coverage = z.infer<typeof coverageSchema>
export type CoverageWithId = z.infer<typeof coverageWithIdSchema>
