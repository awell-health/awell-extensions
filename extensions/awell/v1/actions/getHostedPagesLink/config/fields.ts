import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z, type ZodType } from 'zod'

export const fields = {
  careFlowId: {
    id: 'careFlowId',
    label: 'Care flow ID',
    description: 'The instance ID of the care flow to fetch the link for',
    type: FieldType.STRING,
    required: true,
  },
  stakeholder: {
    id: 'stakeholder',
    label: 'Stakeholder',
    description:
      'The name of the stakeholder to fetch the static Hosted Pages link for. Defaults to "patient" when left empty.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowId: z.string().min(1),
  stakeholder: z
    .optional(z.string())
    .transform((value) => (isNil(value) || isEmpty(value) ? 'patient' : value)),
} satisfies Record<keyof typeof fields, ZodType>)
