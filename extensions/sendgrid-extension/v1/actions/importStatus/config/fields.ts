import { z, type ZodTypeAny } from 'zod'

import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

export const fields = {
  jobId: {
    id: 'jobId',
    label: 'Job ID',
    description:
      'The ID of the Sendgrid Job (usually obtained from the Add or Update Contact action)',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
  },
  wait_for_finished: {
    id: 'wait_for_finished',
    label: 'Wait for finished',
    description:
      'If true, the action will wait for the import job to finish before completing.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  jobId: z.string(),
  wait_for_finished: z.boolean().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
