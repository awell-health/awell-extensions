import {
  DateOnlySchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { startCase } from 'lodash'
import { z } from 'zod'

const periodEnum = z.enum(['AM', 'PM'])
const frequencyEnum = z.enum(['Daily', 'Weekly', 'Monthly'])
const weekdayEnum = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

const recurringSchema = z.discriminatedUnion('frequency', [
  /**
   * If `frequency` is "daily"
   * then "period", "hour" and "minute" are required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.Daily),
    hour: z.coerce.number().min(1).max(12).transform(String),
    minute: z.coerce.number().min(0).max(59).transform(String),
    period: periodEnum,
  }),
  /**
   * If `frequency` is "weekly"
   * then "weekday" is required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.Weekly),
    weekday: weekdayEnum,
  }),
  /**
   * If `frequency` is "monthly"
   * then "monthday" is required
   */
  z.object({
    frequency: z.literal(frequencyEnum.enum.Monthly),
    monthday: z.string().nonempty(),
  }),
])

export const FieldsSchema = z
  .object({
    healthie_patient_id: z.string().nonempty(),
    form_id: z.string().nonempty(),
    is_recurring: z.boolean().optional(),
    frequency: z.string().transform(startCase).optional(),
    period: makeStringOptional(z.string().toUpperCase()),
    minute: makeStringOptional(z.coerce.string()),
    hour: makeStringOptional(z.coerce.string()),
    weekday: makeStringOptional(z.string().transform(startCase)),
    monthday: makeStringOptional(z.string()),
    recurrence_ends: z.boolean().optional(),
    ends_on: makeStringOptional(z.string()),
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
