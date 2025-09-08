import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  DateOnlySchema,
} from '@awell-health/extensions-core'
import { parse, isValid, parseISO } from 'date-fns'

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
    description: 'The time in HH:mm:ss format (e.g., "14:30:00") or full ISO8601 datetime with timezone (e.g., "2025-09-06T15:34:44+02:00").',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referenceDate: DateOnlySchema,
  timeString: z.string().refine((timeStr) => {
    const parsedTime = parse(timeStr, 'HH:mm:ss', new Date())
    if (isValid(parsedTime)) {
      return true
    }
    
    try {
      const parsedISO = parseISO(timeStr)
      return isValid(parsedISO)
    } catch {
      return false
    }
  }, 'Invalid time format. Must be in HH:mm:ss format (e.g., "14:30:00") or ISO8601 datetime with timezone (e.g., "2025-09-06T15:34:44+02:00")'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
