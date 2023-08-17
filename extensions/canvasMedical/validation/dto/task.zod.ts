import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'

const extensionSchema = z.object({
  url: z.string(),
  valueReference: z.object({
    reference: z.string().optional(),
    display: z.string().optional(),
  }),
})

export const taskSchema = z.object({
  resourceType: z.literal('Task'),
  extension: z.array(extensionSchema).optional(),
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
  description: z.string().optional(),
  for: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  owner: z
    .object({
      reference: createReferenceSchema('Practitioner'),
    })
    .optional(),
  authoredOn: z.string().datetime().optional(),
  restriction: z
    .object({
      period: z.object({
        end: z.string().datetime(),
      }),
    })
    .optional(),
  note: z
    .array(
      z.object({
        text: z.string(),
        time: z.string().datetime(),
        authorReference: z.object({
          reference: createReferenceSchema('Practitioner'),
        }),
      })
    )
    .optional(),
  input: z
    .array(
      z.object({
        type: z.object({
          text: z.string(),
        }),
        valueString: z.string(),
      })
    )
    .optional(),
})

export const taskWithIdSchema = taskSchema.extend({
  id: z.string(),
})

export type Task = z.infer<typeof taskSchema>
export type TaskWithId = z.infer<typeof taskWithIdSchema>
