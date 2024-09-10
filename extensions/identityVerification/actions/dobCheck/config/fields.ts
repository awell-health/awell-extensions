import { type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

/**
 * No action fields needed:
 * - The actual DOB we need to check against should be stored in the patient's profile
 * - We'll collect the DOB of the patient in the Hosted Pages app
 *
 * The logic to compare the two will live in Hosted Pages as well.
 */
export const fields = {} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object(
  {} satisfies Record<keyof typeof fields, ZodTypeAny>
)
