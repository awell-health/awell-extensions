import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  careFlowId: {
    id: 'careFlowId',
    label: 'Care flow ID',
    description:
      'The care flow to get the data point value from. Can be a different care flow than the current one.',
    type: FieldType.STRING,
    required: true,
  },
  dataPointDefinitionId: {
    id: 'dataPointDefinitionId',
    label: 'Data point definition ID',
    description: 'The data point definition ID to get the value from.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowId: z.string().min(1),
  dataPointDefinitionId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
