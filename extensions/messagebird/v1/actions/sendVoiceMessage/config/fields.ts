import { type Field, FieldType, StringType } from '../../../../../../lib/types'

export const fields = {
  originator: {
    id: 'originator',
    label: 'Originator',
    description:
      'The sender of the message. This can be a telephone number (including country code) or an alphanumeric string.',
    type: FieldType.STRING,
    required: false,
  },
  recipient: {
    id: 'recipient',
    label: 'Recipient',
    description: 'The mobile number of the recipient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'The content of your message.',
    type: FieldType.TEXT,
    required: true,
  },
  language: {
    id: 'language',
    label: 'Language',
    description:
      'The language in which the message needs to be read to the recipient. Default: en-gb.',
    type: FieldType.STRING,
    required: false,
  },
  voice: {
    id: 'voice',
    label: 'Voice',
    description:
      'The voice in which the messages needs to be read to the recipient. Possible values are: `male`, `female`. Default: `female`',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>
