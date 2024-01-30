import { NumericIdSchema } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import * as z from 'zod'

// All values taken from Elation's API
const letterTypeEnum = z.enum([
  'patient_initiated',
  'patient',
  'referral',
  'provider',
])

export const contactSchema = z.object({
  id: NumericIdSchema,
})

export const letterSchema = z
  .object({
    patient: NumericIdSchema,
    practice: NumericIdSchema,
    body: z.string(),
    send_to_contact: contactSchema,
    subject: z.string().nonempty().optional().nullable(),
    referral_order: NumericIdSchema.optional().nullable(),
    letter_type: letterTypeEnum.default(letterTypeEnum.enum.provider),
  })
  .strict()
  // subject and referral_order cannot be empty at the same time
  .refine((input) => !(isNil(input.subject) && isNil(input.referral_order)), {
    message: "One of either 'subject' or 'referral order' is required.",
  })
