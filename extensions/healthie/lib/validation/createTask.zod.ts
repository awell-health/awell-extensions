import { isNil } from 'lodash'
import { z } from 'zod'
import { DateOnlySchema } from '@awell-health/extensions-core'

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
     *
     * `.optional()` is required on `z.literal(undefined)` in zod 4: unlike
     * zod 3, a bare `z.literal(undefined)` no longer accepts an *absent* key,
     * only a key explicitly set to `undefined`.
     */
    z.object({
      reminderIntervalType: z.literal(undefined).optional(),
      reminderIntervalValue: z.literal(undefined).optional(),
      reminderIntervalValueOnce: z.literal(undefined).optional(),
      isReminderEnabled: z
        .union([z.literal(false), z.literal(undefined)])
        .optional(),
      reminderTime: z.literal(undefined).optional(),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'daily'
     * then `reminderIntervalValue` and `reminderIntervalValueOnce` is obsolete
     */
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.daily),
      reminderIntervalValue: z.literal(undefined).optional(),
      reminderIntervalValueOnce: z.literal(undefined).optional(),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'weekly'
     * then `reminderIntervalValue` should be a comma-separated string of days of the week
     * and `reminderIntervalValueOnce` is obsolete
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
              ', ',
            )}`,
          },
        ),
      reminderIntervalValueOnce: z.literal(undefined).optional(),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
    /**
     * If `isReminderEnabled` is true,
     * and `reminderIntervalType` is 'once'
     * then `reminderIntervalValueOnce` should be an ISO8601 date
     * and `reminderIntervalValue` is obsolete (left for compatibility purposes)
     */
    z.object({
      reminderIntervalType: z.literal(intervalTypeEnum.enum.once),
      // ! preserve for compatibility reasons (use as a fallback)
      reminderIntervalValue: DateOnlySchema.optional(),
      reminderIntervalValueOnce: DateOnlySchema.optional(),
      isReminderEnabled: z.literal(true),
      reminderTime: z.coerce.number(),
    }),
  ])
  .superRefine((value, context) => {
    // if type is `once` and both values are not set
    if (
      value.reminderIntervalType === intervalTypeEnum.enum.once &&
      isNil(value.reminderIntervalValue) &&
      isNil(value.reminderIntervalValueOnce)
    ) {
      context.addIssue({
        code: 'custom',
        fatal: true,
        path: ['reminderIntervalValueOnce'],
        message: 'Value is not a valid ISO8601 date',
        params: {
          reason: 'invalid_date',
          received: value.reminderIntervalValueOnce,
          detail:
            'reminderIntervalType is "once" but neither reminderIntervalValue nor reminderIntervalValueOnce is set',
        },
      })
    }
  })
  .transform(
    ({
      isReminderEnabled,
      reminderIntervalType,
      reminderIntervalValue,
      reminderIntervalValueOnce,
      reminderTime,
    }) => ({
      reminder:
        isNil(isReminderEnabled) || !isReminderEnabled
          ? undefined
          : {
              is_enabled: true,
              interval_type: reminderIntervalType,
              interval_value:
                // ! `reminderIntervalValue` left for compatibility
                reminderIntervalValueOnce ?? reminderIntervalValue,
              reminder_time: reminderTime,
            },
    }),
  )

export const createTaskSchema = z
  .object({
    patientId: z.string().nonempty().optional(),
    assignToUserId: z.string().nonempty().optional(),
    content: z.string().nonempty(),
    dueDate: DateOnlySchema.optional(),
  })
  .and(reminderSchema)
