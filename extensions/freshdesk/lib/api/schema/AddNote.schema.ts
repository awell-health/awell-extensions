import { z } from 'zod'

export const AddNoteInputSchema = z.object({
  body: z.string().min(1).describe('Content of the note in HTML'),
  incoming: z.boolean().optional(),
  notify_emails: z.array(z.string().email()).optional(),
  private: z.boolean().optional(),
  user_id: z.number().optional(),
})

export type AddNoteInputType = z.infer<typeof AddNoteInputSchema>

export const AddNoteResponseSchema = z.object({
  body_text: z.string(),
  body: z.string(),
  id: z.number(),
  incoming: z.boolean(),
  private: z.boolean(),
  user_id: z.number(),
  support_email: z.unknown().nullable(),
  ticket_id: z.number(),
  notified_to: z.array(z.string().email()),
  attachments: z.array(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

export type AddNoteResponseType = z.infer<typeof AddNoteResponseSchema>
