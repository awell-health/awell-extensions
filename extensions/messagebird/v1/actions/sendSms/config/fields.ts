import { type Field, FieldType, StringType } from '@awell-health/awell-extensions-types'

export const fields = {
  originator: {
    id: 'originator',
    label: 'Originator',
    description:
      'The sender of the message. This can be a telephone number (including country code) or an alphanumeric string.',
    type: FieldType.STRING,
    required: true,
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
} satisfies Record<string, Field>
