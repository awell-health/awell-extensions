import z from 'zod'
import { FieldsValidationSchema } from './fields'
import { isNil } from 'lodash'
import { SettingsValidationSchema } from '../../../../settings'

export const CreateFlowExecutionSchema = z
  .object({
    settings: SettingsValidationSchema,
    fields: FieldsValidationSchema,
  })
  .superRefine((value, ctx) => {
    // if both `from` values missing - throw error
    if (isNil(value.settings.fromNumber) && isNil(value.fields.from)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          '"From" number is missing in both settings and in the action field.',
      })
    }
  })
  .transform((val) => {
    return {
      settings: val.settings,
      fields: {
        ...val.fields,
        parameters: JSON.parse(val.fields.parameters),
        from: val.fields.from ?? val.settings.fromNumber,
      },
    }
  })
  .refine((v) => !isNil(v.fields.from) && typeof v.fields.from === 'string')
