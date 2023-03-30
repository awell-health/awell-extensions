import { type Field, FieldType, StringType } from '@/lib/types'

export const fields = {
  originator: {
    id: 'originator',
    label: 'The mobile number the SMS will be send from.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  recipient: {
    id: 'recipient',
    label: 'The mobile number of the recipient.',
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
} satisfies Record<string, Field>
