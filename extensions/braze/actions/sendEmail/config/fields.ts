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
  from: {
    id: 'from',
    label: 'From Email',
    description:
      'Valid email address in the format "Display Name <email@address.com>"',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Email body',
    description: 'Email body content(HTML)',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  appId: z.string().min(1),
  from: z.string().min(1),
  body: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
