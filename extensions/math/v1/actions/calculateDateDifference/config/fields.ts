import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/awell-extensions-types'

export const fields = {
  dateLeft: {
    id: 'dateLeft',
    label: 'Date left (minuend)',
    description:
      'The date from which the other date (date right) is to be subtracted.',
    required: true,
    type: FieldType.DATE,
  },
  dateRight: {
    id: 'dateRight',
    label: 'Date right (subtrahend)',
    description: 'The date to be subtracted from the other date (date left).',
    required: true,
    type: FieldType.DATE,
  },
  unit: {
    id: 'unit',
    label: 'The unit you would like to calculate the difference in',
    description:
      'Choose one of "seconds", "minutes", "hours", "days", "weeks", "months", "years".',
    required: true,
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  dateLeft: z.coerce.date(),
  dateRight: z.coerce.date(),
  unit: z.enum([
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'months',
    'years',
  ]),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
