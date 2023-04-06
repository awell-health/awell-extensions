import { type Field, FieldType, StringType } from '../../../../../../lib/types'

export const fields = {
  from: {
    id: 'from',
    label: 'The channel ID from which the message should be sent.',
    type: FieldType.STRING,
    required: true,
  },
  to: {
    id: 'to',
    label:
      'Either a channel-specific identifier for the receiver (e.g. MSISDN for SMS or WhatsApp channels), or the ID of a MessageBird Contact.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  content: {
    id: 'content',
    label: 'The content of your message.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>
