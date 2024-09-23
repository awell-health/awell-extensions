import { z } from 'zod'

/**
 * Create a record
 */

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

/**
 * Update a record
 */

export const UpdateRecordInputSchema = z.object({
  sObject: z.string().min(1),
  sObjectId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
})

export type UpdateRecordInputType = z.infer<typeof UpdateRecordInputSchema>

export const UpdateRecordResponseSchema = z.undefined()

export type UpdateRecordResponseType = z.infer<
  typeof UpdateRecordResponseSchema
>

/**
 * Get a record
 */

export const GetRecordInputSchema = z.object({
  sObject: z.string().min(1),
  sObjectId: z.string().min(1),
})

export type GetRecordInputType = z.infer<typeof GetRecordInputSchema>

export const GetRecordResponseSchema = z.record(z.string(), z.unknown())

export type GetRecordResponseType = z.infer<typeof GetRecordResponseSchema>
