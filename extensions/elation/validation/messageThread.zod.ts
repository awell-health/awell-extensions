import { z } from 'zod'

export const ThreadMemberSchema = z
  .object({
    id: z.number().int().positive(),
    thread: z.number().int().positive(),
    user: z.number().int().positive().nullable(),
    group: z.number().int().positive().nullable(),
    status: z.enum(['Addressed', 'Requiring Action']), // Updated status values
    ack_time: z
      .string()
      .nullable()
      .refine((val) => val === null || !isNaN(Date.parse(val)), {
        message: "Invalid date format for 'ack_time'",
      }),
  })
  .refine((data) => !(data.user !== null && data.group !== null), {
    message:
      'Should only ever be one of either a user or group set for the thread member', // Updated error message to match docs
  })

const CreateThreadMemberSchema = z.object({
  group: z.number().int().positive().nullable(),
  status: z.enum(['Addressed', 'Requiring Action']),
})

export const messageThreadSchema = z.object({
  patient: z.number().int().positive(),
  sender: z.number().int().positive(),
  practice: z.number().int().positive(),
  document_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for 'document_date'",
  }),
  chart_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for 'chart_date'",
  }),
  is_urgent: z.boolean(),
  members: z.array(CreateThreadMemberSchema),
  messages: z.array(
    z.object({
      body: z.string().min(1, 'Message body is required'),
      send_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for 'send_date'",
      }),
      sender: z.number().int().positive(),
    })
  ),
})
