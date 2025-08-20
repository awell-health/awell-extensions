import { z } from 'zod'
import { Field, FieldType } from '@awell-health/extensions-core'

export const fields: Record<string, Field> = {
  agentId: {
    id: 'agentId',
    label: 'Agent ID',
    type: FieldType.STRING,
    required: true,
  },
}

export const FieldsValidationSchema = z.object({
  agentId: z.string().min(1),
})
