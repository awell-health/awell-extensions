import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { isEmpty } from 'lodash'
import { StringTransformToJson } from '../../../validation'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    type: FieldType.STRING,
    required: false,
    description:
      'An email address that identifies a user profile in Iterable. Provide a recipient email or a recipient user ID, but not both, depending on how your project identifies users.',
  },
  userId: {
    id: 'userId',
    label: 'User ID',
    type: FieldType.STRING,
    required: false,
    description:
      'A user ID that identifies a user profile in Iterable. Provide a recipient email or a recipient user ID, but not both, depending on how your project identifies users.',
  },
  eventName: {
    id: 'eventName',
    label: 'Event name',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  dataFields: {
    label: 'Data fields',
    id: 'dataFields',
    type: FieldType.JSON,
    required: false,
    description: 'Additional data associated with event',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z
  .object({
    email: makeStringOptional(z.string().email()),
    userId: makeStringOptional(z.string()),
    eventName: z.string(),
    dataFields: makeStringOptional(StringTransformToJson),
  } satisfies Record<keyof typeof fields, ZodTypeAny>)
  .superRefine((value, context) => {
    if (isEmpty(value.email) && isEmpty(value.userId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "email" and "user ID" are empty. Please provide one of them.',
      })
    }

    if (!isEmpty(value.email) && !isEmpty(value.userId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'Both "email" and "user ID" are provided. Please provide only one of them.',
      })
    }
  })
