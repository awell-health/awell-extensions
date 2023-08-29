import { DateOnlySchema } from '@awell-health/extensions-core'
import { z } from 'zod'

const periodEnum = z.enum(['AM', 'PM'])
const frequencyEnum = z.enum(['daily', 'weekly', 'monthly'])
const weekdayEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

const recurringSchema = z.discriminatedUnion('frequency', [
  /**
   * If `frequency` is "daily"
   * then "period", "hour" and "minute" are required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.daily),
    hour: z.coerce.number().min(1).max(12),
    minute: z.coerce.number().min(0).max(59),
    period: periodEnum,
  }),
  /**
   * If `frequency` is "weekly"
   * then "weekday" is required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.weekly),
    weekday: weekdayEnum,
  }),
  /**
   * If `frequency` is "monthly"
   * then "monthday" is required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.monthly),
    monthday: z.string(),
  }),
])

export const FieldsSchema = z
  .object({
    healthie_patient_id: z.string().nonempty(),
    form_id: z.string().nonempty(),
    is_recurring: z.boolean().optional(),
    frequency: z.string().optional(),
    period: z.string().optional(),
    minute: z.coerce.number().optional(),
    hour: z.coerce.number().optional(),
    weekday: z.string().optional(),
    monthday: z.string().optional(),
    recurrence_ends: z.boolean().optional(),
    ends_on: z.string().optional(),
  })
  .superRefine(
    (
      {
        healthie_patient_id,
        form_id,
        is_recurring,
        frequency,
        monthday,
        weekday,
        hour,
        minute,
        period,
        recurrence_ends,
        ends_on,
      },
      ctx
    ) => {
      // if is recurring, then check
      if (is_recurring === true) {
        recurringSchema.parse({
          frequency,
          hour,
          minute,
          period,
          weekday,
          monthday,
        })

        if (recurrence_ends === true) {
          DateOnlySchema.parse(ends_on)
        }
      }
    }
  )

// export const createTaskSchema = z
//   .object({
//     patientId: z.string().nonempty().optional(),
//     assignToUserId: z.string().nonempty().optional(),
//     content: z.string().nonempty(),
//     dueDate: DateOnlySchema.optional(),
//   })
//   .and(reminderSchema)
