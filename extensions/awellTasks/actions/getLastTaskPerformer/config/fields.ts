import { type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object(
  {} satisfies Record<keyof typeof fields, ZodTypeAny>,
)
