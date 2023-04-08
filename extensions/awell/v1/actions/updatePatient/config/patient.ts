import { z } from 'zod'

const PatientValidationSchema = z.object({ id: z.string() })

export const validatePatientFields = (
  patient: unknown
): z.infer<typeof PatientValidationSchema> => {
  const parsedData = PatientValidationSchema.parse(patient)

  return parsedData
}
