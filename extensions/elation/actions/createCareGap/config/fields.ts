import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  quality_program: {
    id: 'quality_program',
    label: 'Quality Program',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  definition_id: {
    id: 'definition_id',
    label: 'Definition ID',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  patient_id: {
    id: 'patient_id',
    label: 'Patient ID',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  practice_id: {
    id: 'practice_id',
    label: 'Practice ID',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  created_date: {
    id: 'created_date',
    label: 'Created date',
    type: FieldType.DATE,
    required: true,
    description: '',
  },
  status: {
    id: 'status',
    label: 'Status',
    type: FieldType.STRING,
    required: true,
    description: '',
    options: {
      dropdownOptions: [
        {
          label: 'Open',
          value: 'open',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },
  },
  detail: {
    id: 'detail',
    label: 'Detail',
    type: FieldType.TEXT,
    required: false,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  quality_program: z.string(),
  definition_id: z.string(),
  patient_id: z.string(),
  practice_id: z.string(),
  created_date: z.string().datetime(),
  status: z.enum(['open', 'closed']),
  detail: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

