import { z } from 'zod'

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
