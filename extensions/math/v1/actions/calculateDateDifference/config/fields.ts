import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

const UnitEnum = z.enum([
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
])
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
    label: 'Duration unit',
    description: 'The unit of duration',
    required: true,
    type: FieldType.STRING,
    options: {
      dropdownOptions: Object.values(UnitEnum.enum).map((unit) => ({
        label: unit,
        value: unit,
      })),
    },
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  dateLeft: z.coerce.date(),
  dateRight: z.coerce.date(),
  unit: UnitEnum,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
