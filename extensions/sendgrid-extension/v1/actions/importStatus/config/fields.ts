import { z, type ZodTypeAny } from 'zod'

import {
  type Field,
  FieldType,
  StringType
} from '@awell-health/extensions-core'

export const fields = {
  jobId: {
    id: 'jobId',
    label: 'Job ID',
    description: 'The ID of the Sendgrid Job (usually obtained from the Add or Update Contact action)',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true
  }
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  jobId: z.string()
} satisfies Record<keyof typeof fields, ZodTypeAny>)