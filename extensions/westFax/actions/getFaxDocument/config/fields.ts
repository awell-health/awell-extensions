import { type Field, FieldType } from '@awell-health/extensions-core'
import { type ZodTypeAny, z } from 'zod'

export const fields = {
  faxId: {
    id: 'faxId',
    label: 'Fax Id',
    description: 'Sometimes also referred to as the job ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  faxId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
