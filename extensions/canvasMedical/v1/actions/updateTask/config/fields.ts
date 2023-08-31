import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  taskData: {
    id: 'taskData',
    label: 'Task data',
    description: 'Task data',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  taskData: z.string().nonempty({
    message: 'Missing "Task data"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
