import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "The user's unique ID in Sendbird.",
  },
  nickname: {
    id: 'nickname',
    label: 'Nickname',
    type: FieldType.STRING,
    description: "The user's nickname. Maximum length is 80 characters.",
    required: false,
  },
  issueAccessToken: {
    id: 'issueAccessToken',
    label: 'Issue access token',
    description:
      'Determines whether to revoke the existing access token and create a new one for the user.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  profileUrl: {
    id: 'profileUrl',
    label: 'Profile URL',
    description: "The URL of the user's profile image.",
    type: FieldType.STRING,
    stringType: StringType.URL,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  nickname: makeStringOptional(z.string().max(80)),
  issueAccessToken: z.boolean().optional(),
  profileUrl: makeStringOptional(z.string().url()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
