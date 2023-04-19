import { z } from 'zod'

export const PathwayValidationSchema = z.object({
  definition_id: z.string(),
})
