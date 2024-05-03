import { z } from 'zod'

export const UserReferenceSchema = z.object({
  id: z.string().optional(),
  identifier: z.string().optional(),
  location: z.string().optional(),
})
