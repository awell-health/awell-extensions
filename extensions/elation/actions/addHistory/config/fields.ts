import {
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { HistoryTypes } from '../../../types/history'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient for whom the the history is being created',
    type: FieldType.NUMERIC,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description:
      'The type of history being created. Supported values: Past, Family, Social, Habits, Diet, Exercise, Immunization, Legal, Consultation, Health Maintenance, Past Surgical, Cognitive Status, Functional Status',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(HistoryTypes.enum).map((type) => ({
        label: type,
        value: type,
      })),
    },
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'The text of the history being created',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  type: HistoryTypes,
  text: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
