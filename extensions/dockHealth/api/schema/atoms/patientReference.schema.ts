import { z } from 'zod'

export const PatientReferenceSchema = z.object({
  id: z.string(),
  identifier: z.string().optional(),
  location: z.string().optional(),
})
