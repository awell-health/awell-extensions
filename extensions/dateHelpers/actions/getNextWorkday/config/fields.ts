import { z, type ZodTypeAny } from 'zod'
import { type Field } from '@awell-health/extensions-core'

export const fields = {} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object(
  {} satisfies Record<keyof typeof fields, ZodTypeAny>,
)
