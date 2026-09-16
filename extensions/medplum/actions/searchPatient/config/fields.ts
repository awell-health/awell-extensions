import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  parameter: {
    id: 'parameter',
    label: 'Search Parameter',
    description:
      'FHIR search parameter (e.g., "identifier", "name", "birthdate")',
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
  failIfNotFound: {
    id: 'failIfNotFound',
    label: 'Fail if patient not found?',
    description:
      'If true, the action fails when the search returns no patient, which allows it to be retried. Use this when the patient may not exist in Medplum yet. If false (default), the action completes with an empty patient.',
    type: FieldType.BOOLEAN,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  parameter: z.string().nonempty({
    error: 'Missing "Search Parameter"',
  }),
  value: z.string().nonempty({
    error: 'Missing "Search Value"',
  }),
  failIfNotFound: z.boolean().optional().default(false),
} satisfies Record<keyof typeof fields, ZodType>)
