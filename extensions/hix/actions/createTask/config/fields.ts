import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The HiX patient number of the patient the task is for.',
    type: FieldType.STRING,
    required: true,
  },
  patientName: {
    id: 'patientName',
    label: 'Patient name',
    description: 'The full name of the patient (e.g. "DE BACKER, Marc").',
    type: FieldType.STRING,
    required: true,
  },
  title: {
    id: 'title',
    label: 'Task title',
    description: 'The title of the task as it appears on the worklist.',
    type: FieldType.STRING,
    required: true,
  },
  description: {
    id: 'description',
    label: 'Task description',
    description:
      'Optional description, shown in the detail pane of the worklist.',
    type: FieldType.TEXT,
    required: false,
  },
  requester: {
    id: 'requester',
    label: 'Requester',
    description: 'The system or person requesting the task. Defaults to ZTOP.',
    type: FieldType.STRING,
    required: false,
  },
  launchUrl: {
    id: 'launchUrl',
    label: 'Launch URL',
    description:
      'Optional URL to launch when the task is opened in HiX (e.g. a panel URL with launch context). Supports {patientId} and {taskId} template variables.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  requester: z.string().optional(),
  launchUrl: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
