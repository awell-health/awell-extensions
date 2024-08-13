import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  sObject: {
    id: 'sObject',
    label: 'sObject',
    description: 'The type of the record to create (e.g. "Account" or "Lead")',
    type: FieldType.STRING,
    required: true,
  },
  data: {
    id: 'data',
    label: 'The values for the new record',
    description: 'Array of information used to create a new contact',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  sObject: z.string().min(1),
  data: z
    .string()
    .transform((str) => {
      try {
        return JSON.parse(str)
      } catch (e) {
        throw new Error('Invalid JSON string')
      }
    })
    .refine(
      (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj),
      {
        message: 'Parsed value is not an object',
      }
    )
    .refine(
      (obj) => {
        return Object.keys(obj).every((key) => typeof key === 'string')
      },
      {
        message: 'All keys must be strings',
      }
    )
    .refine(
      (obj) => {
        return Object.values(obj).every((value) => typeof value !== 'undefined')
      },
      {
        message: 'All values must be defined',
      }
    )
    .pipe(z.record(z.unknown())),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
