import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  DateOnlySchema,
} from '@awell-health/extensions-core'
import { parse, isValid } from 'date-fns'

export const fields = {
  referenceDate: {
    id: 'referenceDate',
    label: 'Reference date',
    description: 'The date you want to use as the base for the combined datetime.',
    type: FieldType.DATE,
    required: true,
  },
  timeString: {
    id: 'timeString',
    label: 'Time string',
    description: 'The time in HH:mm:ss format (e.g., "14:30:00").',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: DateOnlySchema,
  timeString: z.string().refine((timeStr) => {
    const parsedTime = parse(timeStr, 'HH:mm:ss', new Date())
    return isValid(parsedTime)
  }, 'Invalid time format. Must be in HH:mm:ss format (e.g., "14:30:00")'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
