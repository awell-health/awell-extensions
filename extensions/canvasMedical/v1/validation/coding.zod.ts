import { z } from 'zod'

export const codeSchema = z.object({
  code: z.string(),
  display: z.string().optional(),
  system: z.string().optional(),
})

export type Code = z.infer<typeof codeSchema>
