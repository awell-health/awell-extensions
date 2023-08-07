import z from 'zod'
import { codeSchema } from './coding.zod'

export const communicationSchema = z.object({
  language: z.object({ coding: z.array(codeSchema), text: z.string() }),
})

export type Communication = z.infer<typeof communicationSchema>
