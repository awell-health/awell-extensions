import { z } from 'zod'

export const startQuerySchema = z.object({
  patientId: z
    .string({ errorMap: () => ({ message: 'Missing patientId' }) })
    .min(1),
  facilityId: z
    .string({ errorMap: () => ({ message: 'Missing facilityId' }) })
    .min(1),
})
