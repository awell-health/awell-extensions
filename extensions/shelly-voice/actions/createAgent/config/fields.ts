import { z } from 'zod'
import { Field, FieldType } from '@awell-health/extensions-core'

export const fields: Record<string, Field> = {
  voice: {
    id: 'voice',
    label: 'Voice',
    type: FieldType.STRING,
    required: true,
  },
  language: {
    id: 'language',
    label: 'Language',
    type: FieldType.STRING,
    required: true,
  },
  personality: {
    id: 'personality',
    label: 'Personality',
    type: FieldType.STRING,
    required: true,
  },
  jobToBeDone: {
    id: 'jobToBeDone',
    label: 'Job To Be Done',
    type: FieldType.STRING,
    required: false,
  },
  patientContext: {
    id: 'patientContext',
    label: 'Patient Context',
    type: FieldType.TEXT,
    required: false,
  },
  careSetting: {
    id: 'careSetting',
    label: 'Care Setting',
    type: FieldType.STRING,
    required: false,
  },
  complianceNotes: {
    id: 'complianceNotes',
    label: 'Compliance Notes',
    type: FieldType.TEXT,
    required: false,
  },
}

export const FieldsValidationSchema = z.object({
  voice: z.string().min(1),
  language: z.string().min(1),
  personality: z.string().min(1),
  jobToBeDone: z.string().optional(),
  patientContext: z.string().optional(),
  careSetting: z.enum(['inpatient', 'outpatient', 'virtual']).optional(),
  complianceNotes: z.string().optional(),
})
