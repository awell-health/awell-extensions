import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  taskId: {
    label: 'Task ID',
    id: 'taskId',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  taskId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
