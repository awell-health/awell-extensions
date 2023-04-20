import { z } from 'zod'

export const PatientValidationSchema = z.object({
  id: z.string(),
  profile: z.object({ patient_code: z.string() }),
})
