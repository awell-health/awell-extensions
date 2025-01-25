import { FieldType, type Field } from '@awell-health/extensions-core'
import {
  PrioritySchema,
  TaskIntentSchema,
  TaskStatusSchema,
} from '../../../../../src/lib/fhir/schemas/Task'
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
    description: 'The status of the task',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(TaskStatusSchema.enum).map((status) => ({
        label: status,
        value: status,
      })),
    },
  },
  intent: {
    id: 'intent',
    label: 'Intent',
    description:
      'Indicates the "level" of actionability associated with the Task.',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(TaskIntentSchema.enum).map((intent) => ({
        label: intent,
        value: intent,
      })),
    },
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: 'The priority of the task',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(PrioritySchema.enum).map((priority) => ({
        label: priority,
        value: priority,
      })),
    },
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
