import { DateOnlySchema, NumericIdSchema } from '@awell-health/extensions-core'
import * as z from 'zod'

const testSchema = z.object({
  id: NumericIdSchema,
})

const contentSchema = z.object({
  patient_instructions: z.string().optional(),
  test_center_notes: z.string().optional(),
  tests: z.array(testSchema).nonempty(),
})

const jsonParseableContentSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      try {
        return JSON.parse(val)
      } catch {
        throw new Error(
          'Validation error: The content field must be JSON parseable and an object after JSON parsing.'
        )
      }
    }
    return val
  })
  .refine((data) => typeof data === 'object')
  .or(z.undefined())

export const labOrderSchema = z
  .object({
    practice: NumericIdSchema,
    patient: NumericIdSchema,
    document_date: DateOnlySchema,
    ordering_physician: NumericIdSchema,
    vendor: NumericIdSchema.optional(),
    content: jsonParseableContentSchema.refine(
      (data) => contentSchema.safeParse(data).success,
      {
        message:
          'Validation error: The content field must conform to the Lab Order Content schema. See https://docs.elationhealth.com/reference/the-lab-order-content-object',
      }
    ),
    site: NumericIdSchema.optional(),
    confidential: z.boolean().optional().default(false),
  })
  .strict()
