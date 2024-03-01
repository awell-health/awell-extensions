import { z } from 'zod'

const CreatorSchema = z.object({
  phone_number: z.optional(z.string()),
  type: z.string(),
  name: z.string(),
})

const PostSchema = z.object({
  body: z.string(),
  created_at: z.number(),
  creator: CreatorSchema,
  conversation_uuid: z.string(),
  uuid: z.string()
})

export const GetMessagesSchema = z.object({
  posts: z.optional(z.array(PostSchema)),
})

const SendMessageResponseSchema = z.object({
  post: PostSchema,
})

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>
export type GetMessagesResponse = z.infer<typeof GetMessagesSchema>
export type Post = z.infer<typeof PostSchema>
