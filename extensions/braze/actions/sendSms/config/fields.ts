import { type Field, FieldType } from '@awell-health/extensions-core'
import { type ZodTypeAny, z } from 'zod'

export const fields = {
  appId: {
    id: 'appId',
    label: 'App Id',
    description: 'App Identifier',
    type: FieldType.STRING,
    required: true,
  },
  subscriptionGroupId: {
    id: 'subscriptionGroupId',
    label: 'Subscription group id',
    description: 'The id of your subscription group',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'SMS message',
    description: 'SMS message content',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  appId: z.string().min(1),
  subscriptionGroupId: z.string().min(1),
  body: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
