import { type Field, FieldType, StringType } from '@/lib/types'

export const fields = {
  originator: {
    id: 'originator',
    label: 'The sender of the message.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  recipient: {
    id: 'recipient',
    label: 'MSISDNS of the recipient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  body: {
    id: 'body',
    label: 'The content of your message.',
    type: FieldType.TEXT,
    required: true,
  },
  language: {
    id: 'language',
    label:
      'The language in which the message needs to be read to the recipient. Default: en-gb.',
    type: FieldType.STRING,
    required: false,
  },
  voice: {
    id: 'voice',
    label:
      'The voice in which the messages needs to be read to the recipient. Possible values are: `male`, `female`. Default: `female`',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>
