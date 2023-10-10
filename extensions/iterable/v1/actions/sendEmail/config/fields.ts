import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { isEmpty } from 'lodash'
import { StringTransformToJson } from '../../../validation'

export const fields = {
  campaignId: {
    label: 'Campaign ID',
    id: 'campaignId',
    type: FieldType.NUMERIC,
    required: true,
    description: '',
  },
  recipientEmail: {
    label: 'Recipient email',
    id: 'recipientEmail',
    type: FieldType.STRING,
    required: false,
    description:
      'An email address that identifies a user profile in Iterable. Provide a recipient email or a recipient user ID, but not both, depending on how your project identifies users.',
  },
  recipientUserId: {
    label: 'Recipient user ID',
    id: 'recipientUserId',
    type: FieldType.STRING,
    required: false,
    description:
      'A user ID that identifies a user profile in Iterable. Provide a recipient email or a recipient user ID, but not both, depending on how your project identifies users.',
  },
  dataFields: {
    label: 'Data fields',
    id: 'dataFields',
    type: FieldType.JSON,
    required: false,
    description: 'Fields to merge into email template.',
  },
  allowRepeatMarketingSends: {
    label: 'Allow repeat marketing sends?',
    id: 'allowRepeatMarketingSends',
    type: FieldType.BOOLEAN,
    required: false,
    description: 'Defaults to true.',
  },
  metadata: {
    label: 'Metadata',
    id: 'metadata',
    type: FieldType.JSON,
    required: false,
    description: 'Metadata to pass back via webhooks. Not used for rendering.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z
  .object({
    campaignId: NumericIdSchema,
    recipientEmail: makeStringOptional(z.string().email()),
    recipientUserId: makeStringOptional(z.string()),
    dataFields: makeStringOptional(StringTransformToJson),
    allowRepeatMarketingSends: z.boolean().optional(),
    metadata: makeStringOptional(StringTransformToJson),
  } satisfies Record<keyof typeof fields, ZodTypeAny>)
  .superRefine((value, context) => {
    if (isEmpty(value.recipientEmail) && isEmpty(value.recipientUserId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "recipient email" and "recipient user ID" are empty. Please provide one of them.',
      })
    }

    if (!isEmpty(value.recipientEmail) && !isEmpty(value.recipientUserId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "recipient email" and "recipient user ID" are provided. Please provide only one of them.',
      })
    }
  })
