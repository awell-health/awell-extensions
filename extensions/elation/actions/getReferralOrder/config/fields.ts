import { z, type ZodTypeAny } from 'zod'
import { NumericIdSchema } from '@awell-health/extensions-core'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  referralOrderId: {
    id: 'referralOrderId',
    label: 'Referral Order ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referralOrderId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
