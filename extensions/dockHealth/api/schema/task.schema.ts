import {
  DateTimeOptionalSchema,
  DateTimeSchema,
} from '@awell-health/extensions-core'
import { z } from 'zod'
import {
  PatientReferenceSchema,
  TaskGroupSchema,
  TaskListReferenceSchema,
  TaskMetadataSchema,
  TaskReferenceSchema,
  TaskWorkflowStatusReferenceSchema,
  UserReferenceSchema,
} from './atoms'

export const TaskSchema = z.object({
  assignedBy: UserReferenceSchema.optional(),
  assignedTo: UserReferenceSchema.optional(),
  assignees: z.array(UserReferenceSchema).optional(),
  comments: z.any(), // Leave untyped for now
  completedBy: UserReferenceSchema.optional(),
  completedDt: DateTimeOptionalSchema,
  createdDateTime: DateTimeSchema,
  creator: UserReferenceSchema,
  description: z.string(), // Required when creating a task
  details: z.string().optional(),
  dueDate: DateTimeOptionalSchema,
  duplicated: z.boolean().optional(),
  edited: z.boolean().optional(),
  hasMentions: z.boolean().optional(),
  id: z.string(),
  identifier: z.string().optional(),
  includeTaskGroup: z.boolean().optional(),
  parentTask: TaskReferenceSchema.optional(),
  patient: PatientReferenceSchema.optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
  read: z.boolean().optional(),
  reminderDt: DateTimeOptionalSchema,
  reminderTime: z.string().optional(),
  reminderType: z
    .enum(['NONE', 'DAY_OF', 'DAY_BEFORE_1', 'DAY_BEFORE_2', 'WEEK_BEFORE_1'])
    .optional(),
  sourceMessage: z.string().optional(),
  status: z.enum(['COMPLETE', 'INCOMPLETE']),
  subTaskSortIndex: z.number().optional(),
  subTasksCompletedCount: z.number().optional(),
  subTasksCount: z.number().optional(),
  subtasks: z.array(z.string()).optional(),
  taskGroup: TaskGroupSchema.optional(),
  taskList: TaskListReferenceSchema, // Required when creating a task
  taskMentions: z.array(z.any()).optional(), // Leave untyped for now,
  taskMetaData: TaskMetadataSchema,
  taskOutcomes: z.array(z.any()).optional(), // Leave untyped for now,
  templateTaskIdentifier: z.string().optional(),
  tokenizedDescription: z.string().optional(),
  tokenizedDetails: z.string().optional(),
  type: z.enum(['IN_APP', 'EMAIL', 'TEMPLATE', 'BUNDLE']).optional(),
  updated: z.boolean().optional(),
  updatedDateTime: DateTimeOptionalSchema,
  workflowStatus: TaskWorkflowStatusReferenceSchema.optional(),
})

export type TaskResponse = z.infer<typeof TaskSchema>

export const CreateTaskSchema = TaskSchema.pick({
  description: true,
  taskList: true,
  patient: true,
  taskMetaData: true,
  taskGroup: true,
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
