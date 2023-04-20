import { z } from 'zod'

export const PatientValidationSchema = z.object({
  profile: z.object({ patient_code: z.string() }),
})
