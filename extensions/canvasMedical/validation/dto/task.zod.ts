import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'
import { periodSchema } from './period.zod'

export const taskSchema = z.object({
  resourceType: z.literal('Task'),
  status: z.enum([
    'draft',
    'requested',
    'received',
    'accepted',
    'rejected',
    'ready',
    'cancelled',
    'in-progress',
    'on-hold',
    'failed',
    'completed',
    'entered-in-error',
  ]),
  requester: z.object({
    reference: createReferenceSchema('Practitioner'),
  }),
  for: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  description: z.string(),
  owner: z.object({
    reference: createReferenceSchema('Practitioner'),
  }),
  authoredOn: z.date(),
  restriction: z.object({
    period: periodSchema,
  }),
  note: z.array(
    z.object({
      text: z.string(),
      time: z.date(),
      authorReference: createReferenceSchema('Practitioner'),
    })
  ),
})

export const taskWithIdSchema = taskSchema.extend({
  id: z.string(),
})

export type Task = z.infer<typeof taskSchema>
