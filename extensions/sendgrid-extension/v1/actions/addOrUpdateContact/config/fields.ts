import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { getEmailValidation } from '../../../../../../src/lib/awell'

export const fields = {
  listIds: {
    id: 'listIds',
    label: 'List IDs',
    description:
      'A comma-separated string of list IDs the contact will be added to.',
    type: FieldType.STRING,
    required: true,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: "The contact's primary email.",
    type: FieldType.STRING,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: "The contact's first name.",
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: "The contact's last name.",
    type: FieldType.STRING,
    required: false,
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      'An object of custom field IDs and the values you want to associate with those custom fields.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

interface CustomFields {
  [key: string]: string | number | boolean | CustomFields
}

export const FieldsValidationSchema = z.object({
  listIds: z
    .string()
    // Make sure all white spaces are stripped
    .transform((chars) => chars.replace(/\s/g, ''))
    .transform((chars) => chars.split(','))
    // Make sure there are no undefined or empty characteristics
    .transform((charsArray) =>
      charsArray.filter((chars) => {
        if (isNil(chars) || isEmpty(chars)) return false

        return true
      })
    ),
  email: getEmailValidation(),
  // max 50 chars - API limit
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  customFields: z.optional(z.string()).transform((str, ctx): CustomFields => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'customFields should be an object',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
