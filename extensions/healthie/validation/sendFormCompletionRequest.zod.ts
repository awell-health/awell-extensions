import { z } from 'zod'

// const periodEnum = z.enum(['am', 'pm'])
// const frequencyEnum = z.enum(['daily', 'weekly', 'monthly'])
// const weekdayEnum = z.enum([
//   'monday',
//   'tuesday',
//   'wednesday',
//   'thursday',
//   'friday',
//   'saturday',
//   'sunday',
// ])

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
  .transform(
    ({
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
    }) => ({ healthie_patient_id, form_id })
  )
//   .discriminatedUnion('reminderIntervalType', [
//     /**
//      * If `isReminderEnabled` is false or undefined,
//      * then all other reminder properties are obsolete.
//      */
//     z.object({
//       reminderIntervalType: z.literal(undefined),
//       reminderIntervalValue: z.literal(undefined),
//       reminderIntervalValueOnce: z.literal(undefined),
//       isReminderEnabled: z.union([z.literal(false), z.literal(undefined)]),
//       reminderTime: z.literal(undefined),
//     }),
//     /**
//      * If `isReminderEnabled` is true,
//      * and `reminderIntervalType` is 'daily'
//      * then `reminderIntervalValue` and `reminderIntervalValueOnce` is obsolete
//      */
//     z.object({
//       reminderIntervalType: z.literal(intervalTypeEnum.enum.daily),
//       reminderIntervalValue: z.literal(undefined),
//       reminderIntervalValueOnce: z.literal(undefined),
//       isReminderEnabled: z.literal(true),
//       reminderTime: z.coerce.number(),
//     }),
//     /**
//      * If `isReminderEnabled` is true,
//      * and `reminderIntervalType` is 'weekly'
//      * then `reminderIntervalValue` should be a comma-separated string of days of the week
//      * and `reminderIntervalValueOnce` is obsolete
//      */
//     z.object({
//       reminderIntervalType: z.literal(intervalTypeEnum.enum.weekly),
//       reminderIntervalValue: z
//         .string()
//         .trim()
//         .toLowerCase()
//         .refine(
//           (value) => {
//             const currentValues = value.split(',').map((el) => el.trim())
//             const possibleValues = intervalValueWeeklyEnum.options as string[]

//             return currentValues.every((el) => possibleValues.includes(el))
//           },
//           {
//             message: `Should be comma-separated list of days: ${intervalValueWeeklyEnum.options.join(
//               ', '
//             )}`,
//           }
//         ),
//       reminderIntervalValueOnce: z.literal(undefined),
//       isReminderEnabled: z.literal(true),
//       reminderTime: z.coerce.number(),
//     }),
//     /**
//      * If `isReminderEnabled` is true,
//      * and `reminderIntervalType` is 'once'
//      * then `reminderIntervalValueOnce` should be an ISO8601 date
//      * and `reminderIntervalValue` is obsolete (left for compatibility purposes)
//      */
//     z.object({
//       reminderIntervalType: z.literal(intervalTypeEnum.enum.once),
//       // ! preserve for compatibility reasons (use as a fallback)
//       reminderIntervalValue: DateOnlySchema.optional(),
//       reminderIntervalValueOnce: DateOnlySchema.optional(),
//       isReminderEnabled: z.literal(true),
//       reminderTime: z.coerce.number(),
//     }),
//   ])
//   .superRefine((value, context) => {
//     // if type is `once` and both values are not set
//     if (
//       value.reminderIntervalType === intervalTypeEnum.enum.once &&
//       isNil(value.reminderIntervalValue) &&
//       isNil(value.reminderIntervalValueOnce)
//     ) {
//       context.addIssue({
//         code: z.ZodIssueCode.invalid_date,
//         fatal: true,
//         path: ['reminderIntervalValueOnce'],
//         message: 'Value is not a valid ISO8601 date',
//       })
//     }
//   })
//   .transform(
//     ({
//       isReminderEnabled,
//       reminderIntervalType,
//       reminderIntervalValue,
//       reminderIntervalValueOnce,
//       reminderTime,
//     }) => ({
//       reminder:
//         isNil(isReminderEnabled) || !isReminderEnabled
//           ? undefined
//           : {
//               is_enabled: true,
//               interval_type: reminderIntervalType,
//               interval_value:
//                 // ! `reminderIntervalValue` left for compatibility
//                 reminderIntervalValueOnce ?? reminderIntervalValue,
//               reminder_time: reminderTime,
//             },
//     })
//   )

// export const createTaskSchema = z
//   .object({
//     patientId: z.string().nonempty().optional(),
//     assignToUserId: z.string().nonempty().optional(),
//     content: z.string().nonempty(),
//     dueDate: DateOnlySchema.optional(),
//   })
//   .and(reminderSchema)
