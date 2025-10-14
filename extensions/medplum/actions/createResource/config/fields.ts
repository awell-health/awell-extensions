import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  resourceJson: {
    id: 'resourceJson',
    label: 'Resource JSON',
    description:
      'FHIR resource or Bundle as JSON. Supports single resources (e.g., Patient, Observation) or FHIR Bundles (transaction/batch) for creating multiple resources.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  resourceJson: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
