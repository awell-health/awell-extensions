import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  bundleRef: {
    id: 'bundleRef',
    label: 'Bundle reference',
    description:
      'Reference to a stored FHIR Bundle (transaction or batch) to execute in Medplum, as returned by an action that stores one, such as the Metriport "Store Webhook Bundle" action.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  bundleRef: z.string().trim().min(1),
} satisfies Record<keyof typeof fields, ZodType>)
