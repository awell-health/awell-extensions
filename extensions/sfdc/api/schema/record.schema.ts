import { z } from 'zod'

export const CreateRecordInputSchema = z.object({
  sObject: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
})

export type CreateRecordInputType = z.infer<typeof CreateRecordInputSchema>

export const CreateRecordResponseSchema = z.object({
  id: z.string(),
  errors: z.array(z.unknown()),
  success: z.boolean(),
})

export type CreateRecordResponseType = z.infer<
  typeof CreateRecordResponseSchema
>
