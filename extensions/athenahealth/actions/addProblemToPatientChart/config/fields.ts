import {
  DateOnlySchema,
  FieldType,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  note: {
    id: 'note',
    label: 'Note',
    description: 'The note to be attached to this problem',
    type: FieldType.TEXT,
    required: true,
  },
  startDate: {
    id: 'startDate',
    label: 'Start date',
    description: 'The onset date to be updated for this problem',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string(),
  practiceId: z.string(),
  note: z.string(),
  startDate: DateOnlySchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
