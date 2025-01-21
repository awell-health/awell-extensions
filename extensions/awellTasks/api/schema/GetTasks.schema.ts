import { z } from 'zod'
import { UserSchema } from './User.schema'
import { PaginationSchema } from './Pagination.schema'

export const TaskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'stuck',
])

/**
 * Input schema
 */
export const GetTasksInputSchema = z.object({
  status: TaskStatusSchema.optional(),
  patient_id: z.string().optional(),
  activity_object_type: z
    .string()
    .optional()
    .describe('Comma-separated list of activity object types'),
  careflow_definition_id: z
    .string()
    .optional()
    .describe('Comma-separated list of careflow definition IDs'),
  careflow_id: z
    .string()
    .optional()
    .describe('Comma-separated list of careflow definition IDs'),
  sort_by: z.enum(['completed_at', 'created_at', 'due_at']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type GetTasksInputType = z.infer<typeof GetTasksInputSchema>

/**
 * Output schema
 */
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  due_at: z.string().datetime(),
  status: TaskStatusSchema,
  task_type: z.string(),
  task_data: z.object({
    task: z.unknown(), // TODO: Add task schema
    pathway: z.unknown(), // TODO: Add pathway schema
    activity: z.unknown(), // TODO: Add activity schema
  }),
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  patient_id: z.string(),
  performer: UserSchema.nullable().optional(),
  patient: z.unknown(), // TODO: Add patient schema
})

export const GetTasksResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  pagination: PaginationSchema,
})

export type GetTasksResponseType = z.infer<typeof GetTasksResponseSchema>
