import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  resourceId: {
    id: 'resourceId',
    label: 'Resource ID',
    description: 'The resource ID of the MedicationRequest in Medplum',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  resourceId: z.string().nonempty({
    message: 'Missing "Resource ID"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
