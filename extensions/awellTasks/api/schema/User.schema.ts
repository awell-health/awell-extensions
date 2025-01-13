import { z } from 'zod'

export const UserSchema = z.object({
  stytch_user_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
})
