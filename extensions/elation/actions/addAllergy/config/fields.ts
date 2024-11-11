import {
  DateTimeOptionalSchema,
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient for whom the lab order is being created.',
    type: FieldType.NUMERIC,
    required: true,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of the allergy drug',
    type: FieldType.STRING,
    required: true,
  },
  startDate: {
    id: 'startDate',
    label: 'Start Date',
    description: 'The date the allergy started (defaults to today)',
    type: FieldType.DATE,
    required: false,
  },
  reaction: {
    id: 'reaction',
    label: 'Reaction',
    description: 'The reaction to the drug',
    type: FieldType.STRING,
    required: false,
  },
  severity: {
    id: 'severity',
    label: 'Severity',
    description: 'How severe the reaction is',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  name: z.string().min(1),
  startDate: DateTimeOptionalSchema.optional(),
  reaction: z.string().optional(),
  severity: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
