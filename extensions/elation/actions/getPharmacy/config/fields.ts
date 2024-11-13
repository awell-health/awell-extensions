import { Field, FieldType } from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  ncpdpId: {
    id: 'ncpdpId',
    label: 'NCPDP ID',
    description: 'The NCPDP ID of the pharmacy',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ncpdpId: z.string(),
})
export type FieldsType = z.infer<typeof FieldsValidationSchema>
