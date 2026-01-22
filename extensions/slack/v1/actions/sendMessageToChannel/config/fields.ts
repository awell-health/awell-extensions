import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  channel: {
    id: 'channel',
    label: 'Channel',
    description:
      'The Slack channel to send the message to. Use the channel ID (e.g., C1234567890) or channel name (e.g., #general). The bot must be invited to the channel.',
    type: FieldType.STRING,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: 'The message content to send to the channel.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  channel: z.string().min(1, { message: 'Channel is required' }),
  message: z.string().min(1, { message: 'Message is required' }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
