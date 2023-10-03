import { z, type ZodTypeAny } from 'zod'
import { NumericIdSchema } from '@awell-health/extensions-core'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  physicianId: {
    id: 'physicianId',
    label: 'Physician ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  physicianId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
