import { isNil } from 'lodash'
import { z } from 'zod'
import { stringDate } from './generic.zod'

const intervalTypeEnum = z.enum(['daily', 'weekly', 'once'])
const intervalValueWeeklyEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

const reminderSchema = z
  .discriminatedUnion('reminderIntervalType', [
    /**
     * If `isReminderEnabled` is false or undefined,
     * then all other reminder properties are obsolete.
     */
    z.object({
      reminderIntervalType: z.literal(undefined),
      reminderIntervalValue: z.literal(undefined),
      isReminderEnabled: z.union([z.literal(false), z.literal(undefined)]),
      reminderTime: z.literal(undefined),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'daily'
     * then `reminderIntervalValue` is obsolete
     */
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.daily),
      reminderIntervalValue: z.literal(undefined),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'weekly'
     * then `reminderIntervalValue` should be a comma-separated string of days of the week
     */
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.weekly),
      reminderIntervalValue: z
        .string()
        .trim()
        .toLowerCase()
        .refine(
          (value) => {
            const currentValues = value.split(',').map((el) => el.trim())
            const possibleValues = intervalValueWeeklyEnum.options as string[]

            return currentValues.every((el) => possibleValues.includes(el))
          },
          {
            message: `Should be comma-separated list of days: ${intervalValueWeeklyEnum.options.join(
              ', '
            )}`,
          }
        ),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'once'
     * then `reminderIntervalValue` should be an ISO8601 date
     */
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.once),
      reminderIntervalValue: stringDate,
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
  ])
  .transform(
    ({
      isReminderEnabled,
      reminderIntervalType,
      reminderIntervalValue,
      reminderTime,
    }) => ({
      reminder:
        isNil(isReminderEnabled) || !isReminderEnabled
          ? undefined
          : {
              is_enabled: true,
              interval_type: reminderIntervalType,
              interval_value: reminderIntervalValue,
              reminder_time: reminderTime,
            },
    })
  )

export const createTaskSchema = z
  .object({
    patientId: z.string().nonempty().optional(),
    assignToUserId: z.string().nonempty().optional(),
    content: z.string().nonempty(),
    dueDate: stringDate.optional(),
  })
  .and(reminderSchema)
