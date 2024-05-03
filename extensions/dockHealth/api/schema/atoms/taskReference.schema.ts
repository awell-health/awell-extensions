import { z } from 'zod'

export const TaskReferenceSchema = z.object({
  id: z.string(),
  identifier: z.string().optional(),
  location: z.string().optional(),
})
