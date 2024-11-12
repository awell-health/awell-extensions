import { NumericIdSchema } from '@awell-health/extensions-core'
import * as z from 'zod'

// Define the shape for each object in the array
export const measurementInputSchema = z.object({
  value: z
    .string()
    .max(10)
    .describe('Measurement value (string up to 10 characters)'),
  note: z
    .string()
    .max(250)
    .optional()
    .describe('Optional note (string up to 250 characters)'),
})

export const AddVitalsInputSchema = z
  .object({
    patient: NumericIdSchema,
    practice: NumericIdSchema,
    visit_note: NumericIdSchema.optional(),
    non_visit_note: NumericIdSchema.optional(),
    bmi: z.number().optional(),
    height: z
      .array(measurementInputSchema)
      .optional()
      .describe('Height; only one item allowed'),
    weight: z
      .array(measurementInputSchema)
      .optional()
      .describe('Weight; only one item allowed'),
    oxygen: z
      .array(measurementInputSchema)
      .optional()
      .describe('Oxygen; only one item allowed'),
    rr: z
      .array(measurementInputSchema)
      .optional()
      .describe('Respiratory rate; only one item allowed'),
    hr: z
      .array(measurementInputSchema)
      .optional()
      .describe('Heart rate; only one item allowed'),
    hc: z
      .array(measurementInputSchema)
      .optional()
      .describe('Head circumference; only one item allowed'),
    temperature: z
      .array(measurementInputSchema)
      .optional()
      .describe('Temperature; only one item allowed'),
    bp: z
      .array(measurementInputSchema)
      .optional()
      .describe('Blood pressure; multiple items allowed'),
    // we are skipping the ketone for now because of lack of documentation on the supported observations
    // ketone: z.array(measurementInputSchema).optional().describe("Optional ketone; see Vital Object Definition for supported observations"),
    bodyfat: z
      .array(measurementInputSchema)
      .optional()
      .describe('Optional body fat; only one item allowed'),
    dlm: z
      .array(measurementInputSchema)
      .optional()
      .describe('Optional DLM; only one item allowed'),
    bfm: z
      .array(measurementInputSchema)
      .optional()
      .describe('Optional BFM; only one item allowed'),
    wc: z
      .array(measurementInputSchema)
      .optional()
      .describe('Optional WC; only one item allowed'),
  })
  .strict()

export type AddVitalsInputType = z.infer<typeof AddVitalsInputSchema>

export interface AddVitalsResponseType extends AddVitalsInputType {
  id: number
}
