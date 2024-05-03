import { z } from 'zod'

export const TaskMetadataSchema = z
  .array(
    z.object({
      customFieldIdentifier: z.string(),
      customFieldName: z.string(),
      value: z.string(),
      values: z.array(z.string()).optional(),
    })
  )
  .optional()
