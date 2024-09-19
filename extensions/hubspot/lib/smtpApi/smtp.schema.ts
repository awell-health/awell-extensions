import { z } from 'zod'

export const SendEmailSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
})

export type SendEmailType = z.infer<typeof SendEmailSchema>
