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
    z.object({
      reminderIntervalType: z.literal(undefined),
      reminderIntervalValue: z.literal(undefined),
      isReminderEnabled: z.union([z.literal(false), z.literal(undefined)]),
      reminderTime: z.literal(undefined),
    }),
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.daily),
      reminderIntervalValue: z.literal(undefined),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.weekly),
      reminderIntervalValue: intervalValueWeeklyEnum,
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
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
