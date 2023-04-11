import { z } from 'zod'

export const PatientValidationSchema = z.object({ id: z.string() })
