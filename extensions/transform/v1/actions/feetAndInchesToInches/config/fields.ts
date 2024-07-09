import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  feet: {
    id: 'feet',
    label: 'Feet',
    type: FieldType.NUMERIC,
    required: true,
  },
  inches: {
    id: 'inches',
    label: 'Inches',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  feet: z.number(),
  inches: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
