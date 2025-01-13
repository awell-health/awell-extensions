import { z } from 'zod'

export const PaginationSchema = z.object({
  total_count: z.number(),
  offset: z.number(),
  limit: z.number(),
})
