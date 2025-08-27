import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  parameter: {
    id: 'parameter',
    label: 'Search Parameter',
    description: 'FHIR search parameter (e.g., "identifier", "name", "birthdate")',
    type: FieldType.STRING,
    required: true,
  },
  value: {
    id: 'value',
    label: 'Search Value',
    description: 'Value to search for (e.g., "12345" for identifier)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  parameter: z.string().nonempty({
    message: 'Missing "Search Parameter"',
  }),
  value: z.string().nonempty({
    message: 'Missing "Search Value"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
