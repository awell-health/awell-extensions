import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { differenceInDays, formatISO9075, isAfter, parseJSON } from 'date-fns'
import { StringTransformToJson } from '../../../validation'

export const fields = {
  campaignId: {
    label: 'Campaign ID',
    id: 'campaignId',
    type: FieldType.NUMERIC,
    required: true,
    description: 'Campaign ID in Iterable.',
  },
  recipientEmail: {
    label: 'Recipient Email',
    id: 'recipientEmail',
    type: FieldType.STRING,
    required: false,
    description:
      'An email address that identifies a user profile in Iterable. Provide a recipientEmail or a recipientUserId (but not both), depending on how your project identifies users.',
  },
  recipientUserId: {
    label: 'Recipient User ID',
    id: 'recipientUserId',
    type: FieldType.STRING,
    required: false,
    description:
      'A user ID that identifies a user profile in Iterable. Provide a recipientEmail or a recipientUserId (but not both), depending on how your project identifies users.',
  },
  dataFields: {
    label: 'Data Fields',
    id: 'dataFields',
    type: FieldType.JSON,
    required: false,
    description: 'Fields to merge into email template.',
  },
  sendAt: {
    label: 'Send At',
    id: 'sendAt',
    type: FieldType.STRING,
    required: false,
    description:
      'Schedule the message for up to 365 days in the future. If set in the past, email is sent immediately. Format is YYYY-MM-DD HH:MM:SS in UTC.',
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
    sendAt: makeStringOptional(
      z.coerce
        .date({
          errorMap: () => ({
            message: 'Requires date in valid format (ISO 9075)',
          }),
        })
        .transform((arg) => formatISO9075(arg))
    ),
    allowRepeatMarketingSends: z.boolean().optional(),
    metadata: makeStringOptional(StringTransformToJson),
  } satisfies Record<keyof typeof fields, ZodTypeAny>)
  .superRefine((value, context) => {
    if (isEmpty(value.recipientEmail) && isEmpty(value.recipientUserId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "recipientEmail" and "recipientUserId" are empty. Please provide one of them.',
      })
    }

    if (!isEmpty(value.recipientEmail) && !isEmpty(value.recipientUserId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "recipientEmail" and "recipientUserId" are provided. Please provide only one of them.',
      })
    }

    const currentDate = new Date()
    const parsedScheduleDate =
      !isEmpty(value.sendAt) && !isNil(value.sendAt)
        ? parseJSON(value.sendAt)
        : undefined

    if (
      parsedScheduleDate !== undefined &&
      isAfter(parsedScheduleDate, currentDate) &&
      differenceInDays(parsedScheduleDate, currentDate) > 365
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Schedule is set over 365 days in the future. Maximum is 365 days.',
      })
    }
  })
