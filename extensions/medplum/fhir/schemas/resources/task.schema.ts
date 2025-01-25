import { DateOnlyOptionalSchema } from '@awell-health/extensions-core'
import { z } from 'zod'
import {
  PrioritySchema,
  TaskIntentSchema,
  TaskStatusSchema,
} from '../../../../../src/lib/fhir/schemas/Task'

export const CreateTaskSchema = z.object({
  patientId: z.string().nonempty('Missing Medplum patient ID'),
  taskTitle: z.string().nonempty('Missing Task title'),
  description: z.string().optional(),
  status: TaskStatusSchema,
  intent: TaskIntentSchema,
  priority: PrioritySchema.optional(),
  dueDate: DateOnlyOptionalSchema,
  performerType: z.string().optional(),
})
