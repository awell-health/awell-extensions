import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  quality_program: {
    id: 'quality_program',
    label: 'Quality Program',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  caregap_id: {
    id: 'caregap_id',
    label: 'Care Gap ID',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  quality_program: z.string(),
  caregap_id: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

