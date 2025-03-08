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
  dateFilterPrompt: {
    id: 'dateFilterPrompt',
    label: 'Describe the date or time period to search for',
    type: FieldType.TEXT,
    required: false,
    description:
      'Provide clear instructions about the date or time period you want to search for. If you use relative instructions (e.g. "Within the next 12 hours") they will be evaluated against the current date and time when this activity is orchestrated.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  prompt: z.string().min(1),
  dateFilterPrompt: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
