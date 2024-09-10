import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

/**
 * No action fields needed:
 * - The actual DOB we need to check against should be stored in the patient's profile
 * - We'll collect the DOB of the patient in the Hosted Pages app
 *
 * The logic to compare the two will live in Hosted Pages as well.
 */
export const fields = {
  label: {
    id: 'label',
    label: 'Label',
    description: 'Label shown to the user above the date input',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  label: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
