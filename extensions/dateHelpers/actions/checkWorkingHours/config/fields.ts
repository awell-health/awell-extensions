import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  workingHoursStart: {
    id: 'workingHoursStart',
    label: 'Working hours start',
    description:
      'The start time of working hours in HH:MM format (e.g., "09:00"). Uses 24-hour format.',
    type: FieldType.STRING,
    required: true,
  },
  workingHoursEnd: {
    id: 'workingHoursEnd',
    label: 'Working hours end',
    description:
      'The end time of working hours in HH:MM format (e.g., "17:00"). Uses 24-hour format.',
    type: FieldType.STRING,
    required: true,
  },
  timezone: {
    id: 'timezone',
    label: 'Timezone',
    description:
      'The IANA timezone identifier to use for the working hours check (e.g., "America/New_York", "Europe/London", "Asia/Tokyo", "UTC"). If not specified, UTC will be used.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  workingHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Working hours start must be in HH:MM format (e.g., "09:00")',
  }),
  workingHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Working hours end must be in HH:MM format (e.g., "17:00")',
  }),
  timezone: z.string().optional().default('UTC'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
