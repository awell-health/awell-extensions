import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  trackId: {
    id: 'trackId',
    label: 'Track ID',
    description:
      'The ID of the ad hoc track that you want to add to the patient care flow.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  trackId: z.string().nonempty('Track ID is required'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
