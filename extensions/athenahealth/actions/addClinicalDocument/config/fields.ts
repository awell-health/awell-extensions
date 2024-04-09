import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  departmentid: {
    id: 'departmentid',
    label: 'Department ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  patientid: {
    id: 'patientid',
    label: 'Patient ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  attachmentcontents: {
    id: 'attachmentcontents',
    label: 'Content',
    description: '',
    type: FieldType.HTML,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  departmentid: z.string().min(1),
  patientid: z.string().min(1),
  attachmentcontents: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
