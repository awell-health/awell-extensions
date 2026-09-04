import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodType } from 'zod'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  healthiePatientId: {
    id: 'healthiePatientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  healthieFormId: {
    id: 'healthieFormId',
    label: 'Healthie form ID',
    description: 'The ID of the form in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  lockFormAnswerGroup: {
    id: 'lockFormAnswerGroup',
    label: 'Lock form answer group',
    description: 'Locking the form will stop any further editing',
    type: FieldType.BOOLEAN,
    required: false,
  },
  metadataFormAnswerGroup: {
    id: 'metadataFormAnswerGroup',
    label: 'The Form Answer Group submission Metadata',
    description: 'Metadata which will push with the form submission',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  healthiePatientId: z.string().min(1),
  healthieFormId: z.string().min(1),
  lockFormAnswerGroup: z.boolean().optional(),
  metadataFormAnswerGroup: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined
      try {
        return JSON.parse(str)
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodType>)
