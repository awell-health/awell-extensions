import { z } from 'zod'
import { patientCreateSchema } from '../patient/validation'

export const enrollInMonitoringSchema = patientCreateSchema.extend({
  cohortName: z.coerce
    .string({ error: 'Requires a Cohort name' })
    .trim()
    .min(1, 'Requires a Cohort name'),
})

export type EnrollInMonitoring = z.infer<typeof enrollInMonitoringSchema>
