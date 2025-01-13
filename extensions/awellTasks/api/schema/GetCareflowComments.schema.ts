import { z } from 'zod'
import { UserSchema } from './User.schema'
import { PaginationSchema } from './Pagination.schema'

/**
 * Input schema
 */
export const GetCareflowCommentsInputSchema = z.object({
  careflowId: z.string().min(1),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type GetCareflowCommentsInputType = z.infer<
  typeof GetCareflowCommentsInputSchema
>

/**
 * Output schema
 */
const CommentSchema = z.object({
  comment_id: z.string(),
  comment: z.object({
    id: z.string(),
    text: z.string(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    task_id: z.string(),
    created_by: UserSchema,
    updated_by: UserSchema,
    status: z.string(),
  }),
  parent_id: z.string().nullable(),
})

export const GetCareflowCommentsResponseSchema = z.object({
  comments: z.array(CommentSchema),
  pagination: PaginationSchema,
})

export type GetCareflowCommentsResponseType = z.infer<
  typeof GetCareflowCommentsResponseSchema
>
