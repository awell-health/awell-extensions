import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientResourceId: {
    id: 'patientResourceId',
    label: 'Patient resource ID',
    type: FieldType.STRING,
    description: 'The patient’s FHIR resource ID.',
    required: true,
  },
  encounterResourceId: {
    id: 'encounterResourceId',
    label: 'Encounter resource ID',
    description: 'The FHIR resource ID of the related encounter.',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Document type',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: [
        {
          value: 'Progress Note',
          label: 'Progress Note',
        },
      ],
    },
  },
  note: {
    id: 'note',
    label: 'Note',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientResourceId: z.string().min(1),
  encounterResourceId: z.string().min(1),
  type: z.enum(['Progress Note']),
  note: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
