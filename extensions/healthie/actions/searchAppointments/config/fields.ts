import { DateTimeSchema } from '@awell-health/extensions-core'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { tz } from 'moment-timezone'

export const fields = {
  userId: {
    id: 'userId',
    label: 'User ID',
    description: 'The ID of the user in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  startDate: {
    id: 'startDate',
    label: 'Start date',
    description: '',
    type: FieldType.DATE,
    required: true,
  },
  endDate: {
    id: 'endDate',
    label: 'End date',
    description: '',
    type: FieldType.DATE,
    required: true,
  },
  timezone: {
    id: 'timezone',
    label: 'Timezone',
    description: '#',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  filter: {
    id: 'filter',
    label: 'Filter',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  startDate: DateTimeSchema,
  endDate: DateTimeSchema,
  timezone: z.string().refine(
    (value) => {
      const timeZones = tz.names()
      return timeZones.includes(value)
    },
    {
      message: 'Invalid time zone',
    }
  ),
  appointmentTypeId: z.string().nonempty(),
  filter: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
