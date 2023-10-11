import { z } from 'zod'

export const fieldsValidationSchema = z.object({
  patientId: z.string().nonempty(),
  quickNote: z.string().nonempty(),
  overwrite: z.boolean(),
})
