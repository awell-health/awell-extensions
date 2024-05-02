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
  fromEmail: {
    id: 'fromEmail',
    label: 'From email',
    description: 'Valid email address',
    type: FieldType.STRING,
    required: true,
  },
  fromName: {
    id: 'fromName',
    label: 'From name',
    description: 'Display name used for "from" address',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Email body',
    description: 'Email body content',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  appId: z.string().min(1),
  fromEmail: z.string().min(1),
  fromName: z.string().min(1),
  body: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
