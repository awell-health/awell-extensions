import { type Field, FieldType } from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  icd_codes: {
    id: 'icd_codes',
    label: 'ICD Codes',
    description:
      "A comma-separated list of ICD-10 codes (e.g. 'E12.1, E14, H10', etc.)",
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const FieldSchema = z
  .object({
    icd_codes: z.string(),
  })
  .transform((data) => {
    const codes = data.icd_codes
      .split(',')
      .map((code) => code.trim().split('.')[0])
    return {
      icd_codes: codes,
    }
  })
  .superRefine((data, ctx) => {
    if (data.icd_codes.length === 0) {
      return {
        icd_codes: [],
      }
    }
    data.icd_codes.forEach((c) => {
      const isValid = c.match(/^[A-Z]\d{2}$/)
      if (isValid === null) {
        ctx.addIssue({
          message: `${c} is an invalid ICD-10 code`,
          fatal: true,
          code: 'custom',
        })
      }
    })
  })
