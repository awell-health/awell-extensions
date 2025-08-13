import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    type: FieldType.NUMERIC,
    description: 'Patient ID',
    required: true,
  },
  physicianId: {
    id: 'physicianId',
    label: 'Physician ID',
    type: FieldType.NUMERIC,
    description: 'Physician ID',
    required: false,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    type: FieldType.NUMERIC,
    description: 'Practice ID',
    required: false,
  },
  from_date: {
    id: 'from_date',
    label: 'From Date',
    type: FieldType.DATE,
    description: 'Date from which to filter appointments',
    required: false,
  },
  to_date: {
    id: 'to_date',
    label: 'To date',
    type: FieldType.DATE,
    description: 'Date to which appointments are filtered',
    required: false,
  },
  event_type: {
    id: 'event_type',
    label: 'Event Type',
    type: FieldType.STRING,
    description: 'Event Type (`appointment` or leave empty)',
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  physicianId: NumericIdSchema.optional(),
  practiceId: NumericIdSchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  event_type: z.literal('appointment').optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
