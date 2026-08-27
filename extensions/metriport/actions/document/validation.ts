import { z } from 'zod'

export const startQuerySchema = z.object({
  patientId: z.string({ error: 'Missing patientId' }).min(1),
  facilityId: z.string().optional(),
})

export const getUrlSchema = z.object({
  fileName: z.string({ error: 'Missing fileName' }),
})
