import { FieldType, type Field } from '@awell-health/extensions-core'
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
  departmentId: {
    id: 'departmentId',
    label: 'Department ID',
    description: 'The department ID associated with the uploaded document.',
    type: FieldType.STRING,
    required: true,
  },
  actionNote: {
    id: 'actionNote',
    label: 'Any note to accompany the creation of this document',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  documentContent: {
    id: 'documentContent',
    label: 'Content of the document',
    description: '',
    type: FieldType.HTML,
    required: true,
  },
  autoClose: {
    id: 'autoClose',
    label: 'Auto close?',
    description:
      'Documents will, normally, automatically appear in the clinical inbox for providers to review. In some cases, you might want to force the document to skip the clinical inbox, and go directly to the patient chart with a "closed" status.',
    type: FieldType.BOOLEAN,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string(),
  practiceId: z.string(),
  departmentId: z.string(),
  actionNote: z.string(),
  documentContent: z.string(),
  autoClose: z.boolean(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
