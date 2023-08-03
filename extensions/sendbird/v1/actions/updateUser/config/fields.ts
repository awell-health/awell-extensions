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
    description: "A user's unique ID.",
  },
  nickname: {
    id: 'nickname',
    label: 'Nickname',
    type: FieldType.STRING,
    description:
      "Specifies the user's nickname. Maximum length is 80 characters.",
    required: false,
  },
  issueAccessToken: {
    id: 'issueAccessToken',
    label: 'Issue access token',
    description: 'Determines whether to create an access token for the user.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  profileUrl: {
    id: 'profileUrl',
    label: 'Profile URL',
    description:
      'URL to an image that will be set as profile image of the user',
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
