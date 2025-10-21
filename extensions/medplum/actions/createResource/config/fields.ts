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
  searchResourceType: {
    id: 'searchResourceType',
    label: 'Search Resource Type',
    description:
      'Optional: FHIR resource type to search for (e.g., Patient, Observation). If provided along with Search Identifier, the action will search for existing resources before creating a new one.',
    type: FieldType.STRING,
    required: false,
  },
  searchIdentifier: {
    id: 'searchIdentifier',
    label: 'Search Identifier',
    description:
      'Optional: Identifier value to search for (e.g., MRN, SSN). If provided along with Search Resource Type, the action will search for existing resources with this identifier before creating a new one.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  resourceJson: z.string().min(1),
  searchResourceType: z.string().optional(),
  searchIdentifier: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
