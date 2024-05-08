import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The identifier of the patient in Medplum to assign the response to',
    type: FieldType.STRING,
    required: true,
  },
  questionnaireResponseId: {
    id: 'questionnaireResponseId',
    label: 'Questionnaire response ID',
    description:
      'The identifier of the questionnaire response you want to link the calculation result to',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string().min(1),
  questionnaireResponseId: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
