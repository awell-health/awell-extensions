import { z } from 'zod'

export const StopActiveCallInputSchema = z.object({
  call_id: z.string().min(1),
})

export const StopActiveCallResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
})

export type StopActiveCallInputType = z.infer<
  typeof StopActiveCallInputSchema
>

export type StopActiveCallResponseType = z.infer<
  typeof StopActiveCallResponseSchema
>
