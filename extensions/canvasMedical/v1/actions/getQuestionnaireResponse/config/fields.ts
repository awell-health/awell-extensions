import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  questionnaireResponseId: {
    id: 'questionnaireResponseId',
    label: 'Questionnaire Response Id',
    description: 'The FHIR resource id for the QuestionnaireResponse resource',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  questionnaireResponseId: z.string().nonempty({
    message: 'Missing "Questionnaire Response ID"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
