import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email of the contact',
    type: FieldType.STRING,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First name',
    description: 'The first name of the contact',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last name',
    description: 'The last name of the contact',
    type: FieldType.STRING,
    required: false,
  },
  phone: {
    id: 'phone',
    label: 'Phone',
    description: 'The phone number of the contact',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  customProperties: {
    id: 'customProperties',
    label: 'Custom properties',
    description:
      'An object of key-values pairs of custom properties of the contact',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  email: z.string().min(1).email(),
  firstName: z
    .string()
    .optional()
    .transform((val) => (isEmpty(val) ? undefined : val)),
  lastName: z
    .string()
    .optional()
    .transform((val) => (isEmpty(val) ? undefined : val)),
  phone: z
    .string()
    .optional()
    .transform((val) => (isEmpty(val) ? undefined : val)),
  customProperties: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'The value should represent an object',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
