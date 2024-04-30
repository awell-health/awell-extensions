import { FieldType, type Field } from '@awell-health/extensions-core'
import { type ZodObject, type ZodTypeAny } from 'zod'
import { CreateTaskSchema } from '../../../fhir/schemas/resources'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'ID of the patient in Medplum the task is for',
    type: FieldType.STRING,
    required: true,
  },
  taskTitle: {
    id: 'taskTitle',
    label: 'Task name',
    description: 'Briefly describes what the task involves',
    type: FieldType.STRING,
    required: true,
  },
  description: {
    id: 'description',
    label: 'Description name',
    description: 'Human-readable explanation of task',
    type: FieldType.STRING,
    required: false,
  },
  status: {
    id: 'status',
    label: 'Status',
    description:
      'The status of the task. Allowed values: draft | requested | received | accepted | rejected | ready | cancelled | in-progress | on-hold | failed | completed | entered-in-error',
    type: FieldType.STRING,
    required: true,
  },
  intent: {
    id: 'intent',
    label: 'Mobile phone',
    description:
      'Indicates the "level" of actionability associated with the Task. Allowed values: unknown | proposal | plan | order | original-order | reflex-order | filler-order | instance-order | option',
    type: FieldType.STRING,
    required: true,
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: 'Allowed values: routine | urgent | asap | stat',
    type: FieldType.STRING,
    required: false,
  },
  dueDate: {
    id: 'dueDate',
    label: 'Due date',
    description: '',
    type: FieldType.DATE,
    required: false,
  },
  performerType: {
    id: 'performerType',
    label: 'Performer type',
    description: 'Indicate which role can/should perform this task',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = CreateTaskSchema satisfies ZodObject<
  Record<keyof typeof fields, ZodTypeAny>
>
