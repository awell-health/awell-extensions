import {
  DateOnlyOptionalSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { capitalize } from 'lodash'
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
// healthie doesn't validate correct form and can lead to errors - validation on our side
const monthdayEnum = z.enum([
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
  '13th',
  '14th',
  '15th',
  '16th',
  '17th',
  '18th',
  '19th',
  '20th',
  '21st',
  '22nd',
  '23rd',
  '24th',
  '25th',
  '26th',
  '27th',
  '28th',
  '29th',
  '30th',
  '31st',
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
    monthday: monthdayEnum,
  }),
])

export const FieldsSchema = z
  .object({
    healthie_patient_id: z.string().nonempty(),
    form_id: z.string().nonempty(),
    is_recurring: z.boolean().optional(),
    frequency: z.string().transform(capitalize).optional(),
    period: makeStringOptional(z.string().toUpperCase()),
    minute: makeStringOptional(z.coerce.string()),
    hour: makeStringOptional(z.coerce.string()),
    weekday: makeStringOptional(z.string().transform(capitalize)),
    monthday: makeStringOptional(z.string().toLowerCase()),
    ends_on: DateOnlyOptionalSchema,
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
      }
    }
  )
