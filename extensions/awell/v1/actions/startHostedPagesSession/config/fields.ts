import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  careFlowId: {
    id: 'careFlowId',
    label: 'Care flow ID',
    description: 'The instance ID of the care flow to start a session for',
    type: FieldType.STRING,
    required: true,
  },
  stakeholder: {
    id: 'stakeholder',
    label: 'Stakeholder',
    description: 'The name of the stakeholder to start the session for',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowId: z.string().min(1),
  stakeholder: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
