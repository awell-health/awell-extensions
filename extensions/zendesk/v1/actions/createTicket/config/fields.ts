import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  external_id: {
    label: 'External ID',
    id: 'external_id',
    type: FieldType.STRING,
    required: false,
    description:
      'An ID you can use to link Zendesk tickets to records in your system.',
  },
  tag: {
    label: 'Tag',
    id: 'tag',
    type: FieldType.STRING,
    required: false,
    description: 'Optional tag to add to the created ticket.',
  },
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    required: true,
    description: 'Subject of the ticket.',
  },
  comment: {
    label: 'Comment',
    id: 'comment',
    type: FieldType.TEXT,
    required: true,
    description: 'Initial comment body for the ticket.',
  },
  requester_email: {
    label: 'Requester email',
    id: 'requester_email',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    required: true,
    description: 'Email of the requester creating the ticket.',
  },
  requester_name: {
    label: 'Requester name',
    id: 'requester_name',
    type: FieldType.STRING,
    required: false,
    description: 'Optional name of the requester.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  external_id: z.string().optional(),
  tag: z.string().optional(),
  subject: z.string().nonempty(),
  comment: z.string().nonempty(),
  requester_email: z.string().email(),
  requester_name: makeStringOptional(z.string()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
