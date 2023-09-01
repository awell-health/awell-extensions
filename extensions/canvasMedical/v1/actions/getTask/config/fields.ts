import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  taskId: {
    id: 'taskId',
    label: 'Task ID',
    description: 'The task ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  taskId: z.string().nonempty({
    message: 'Missing "Task ID"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
