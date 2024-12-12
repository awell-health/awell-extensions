import { z, type ZodTypeAny } from 'zod'
import { NumericIdSchema } from '@awell-health/extensions-core'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { AuthorizationForSchema } from '../../../validation/referralOrder.zod'

export const fields = {
  patient: {
    id: 'patient',
    label: 'Patient ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  practice: {
    id: 'practice',
    label: 'Practice ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  contact_name: {
    id: 'contact_name',
    label: 'Contact name',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  body: {
    id: 'body',
    label: 'Body',
    type: FieldType.TEXT,
    required: true,
    description: '',
  },
  authorization_for: {
    id: 'authorization_for',
    label: 'Authorization for',
    type: FieldType.STRING,
    required: true,
    description: '',
    options: {
      dropdownOptions: Object.values(AuthorizationForSchema.enum).map((template) => ({
        label: template,
        value: template,
      })),
    },
  },
  consultant_name: {
    id: 'consultant_name',
    label: 'Consultant name',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  specialty: {
    id: 'specialty',
    label: 'Specialty',
    type: FieldType.STRING,
    required: false,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patient: NumericIdSchema,
  practice: NumericIdSchema,
  contact_name: z.string(),
  body: z.string(),
  authorization_for: AuthorizationForSchema,
  consultant_name: z.string(),
  specialty: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
