import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  description: {
    id: 'description',
    label: 'Description',
    description: 'Description of the task',
    type: FieldType.STRING,
    required: true,
  },
  taskListId: {
    id: 'taskListId',
    label: 'Task list ID',
    description: 'The task list identifier.',
    type: FieldType.STRING,
    required: true,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient the task is associated with',
    type: FieldType.STRING,
    required: false,
  },
  taskGroupId: {
    id: 'taskGroupId',
    label: 'Task group ID',
    description: 'The group to assign the task to',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  description: z.string().min(1),
  taskListId: z.string().min(1),
  patientId: z.string().optional(),
  taskGroupId: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
