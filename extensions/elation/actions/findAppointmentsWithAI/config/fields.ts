import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Elation patient ID',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  prompt: {
    id: 'prompt',
    label: 'Describe the appointments to search for',
    type: FieldType.TEXT,
    required: true,
    description:
      'Provide clear instructions about what appointments you want to find. You can search by appointment type (e.g. "Find all PCP visits"), status (e.g., "Find scheduled appointments"), or other criteria. Be as specific as possible for best results.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  prompt: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
