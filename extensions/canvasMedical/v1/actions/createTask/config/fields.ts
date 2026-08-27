import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  taskData: {
    id: 'taskData',
    label: 'Task data',
    description: 'Task data',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  taskData: z.string().nonempty({
    error: 'Missing "Task data"',
  }),
} satisfies Record<keyof typeof fields, ZodType>)
