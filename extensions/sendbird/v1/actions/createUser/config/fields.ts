import { z, type ZodTypeAny } from 'zod'
import { isEmpty, isNil } from 'lodash'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { type Metadata } from '../../../types'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description:
      "Specifies a user's unique ID. Maximum length is 80 characters.",
  },
  nickname: {
    id: 'nickname',
    label: 'Nickname',
    type: FieldType.STRING,
    description:
      "Specifies the user's nickname. Maximum length is 80 characters.",
    required: true,
  },
  issueAccessToken: {
    id: 'issueAccessToken',
    label: 'Issue access token',
    description: 'Determines whether to create an access token for the user.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'Specifies a JSON object to store up to five key-value items for additional user information such as a phone number, an email address, or a long description of the user. The key must not have a comma (,), and the value must be a string.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().max(80).nonempty(),
  nickname: z.string().max(80).nonempty(),
  issueAccessToken: z.boolean().optional(),
  metadata: z.optional(z.string()).transform((str, ctx): Metadata => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'metadata should be an object',
        })
        return z.NEVER
      }

      const values = Object.values(parsedJson)

      if (values.length > 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'metadata should have maximum of five key-value items',
        })
        return z.NEVER
      }

      if (values.some((val) => typeof val !== 'string')) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each metadata key must be a string',
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
