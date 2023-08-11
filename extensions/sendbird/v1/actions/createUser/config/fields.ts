import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { MetadataValidationSchema } from '../../../validation'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description:
      "Specify a unique ID for the user, maximum length is 80 characters. Don't use personally identifiable information (PII) for the ID.",
  },
  nickname: {
    id: 'nickname',
    label: 'Nickname',
    type: FieldType.STRING,
    description: "The user's nickname. Maximum length is 80 characters.",
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
      'Specifies a JSON object to store up to five key-value items for additional user information such as a phone number, an email address, or a long description of the user. The key must not have a comma (,) and its length is limited to 128 characters. The value must be a string and its length is limited to 190 characters.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().max(80).nonempty(),
  nickname: z.string().max(80).nonempty(),
  issueAccessToken: z.boolean().optional(),
  metadata: z.optional(MetadataValidationSchema),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
