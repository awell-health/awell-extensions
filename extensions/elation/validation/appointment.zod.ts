import { DateTimeSchema, NumericIdSchema } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import * as z from 'zod'

export const statusEnum = z.enum([
  'Scheduled',
  'Confirmed',
  'Checked Out',
  'Cancelled',
  'With Doctor',
  'In Room',
  'Checked In',
  'In Room - Vitals Taken',
  'Not Seen',
  'Billed',
])

export const statusSchema = z.object({
  status: statusEnum,
  room: z.string().optional(),
})

const statusReturnSchema = statusSchema.extend({
  status_date: z.string().datetime(),
  status_detail: z.string(),
})

export const appointmentSchema = z
  .object({
    scheduled_date: DateTimeSchema,
    duration: z.coerce.number().int().min(1).max(1440).optional(),
    reason: z.string().max(50).nonempty(),
    description: z.string().max(500).optional(),
    status: z.union([statusReturnSchema, statusSchema]).optional(),
    service_location: z.coerce.number().int().min(1).optional(),
    telehealth_details: z.string().optional(),
    patient: NumericIdSchema,
    physician: NumericIdSchema,
    practice: NumericIdSchema,
    metadata: z.object({}).passthrough().nullish(),
  })
  .strict()

export const FindAppointmentFieldSchema = z
  .object({
    patientId: z.number(),
    physicianId: z.number().optional(),
    practiceId: z.number().optional(),
    from_date: z.string().datetime().optional(),
    to_date: z.string().datetime().optional(),
    event_type: z.literal('appointment').optional(),
  })
  .transform((data) => {
    return {
      patient: data.patientId,
      ...(!isNil(data.practiceId) && { practice: data.practiceId }),
      ...(!isNil(data.physicianId) && { physician: data.physicianId }),
      ...(!isNil(data.from_date) && { from_date: data.from_date }),
      ...(!isNil(data.to_date) && { to_date: data.to_date }),
      ...(!isNil(data.event_type) && { event_type: 'appointment' }),
    }
  })
