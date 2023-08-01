import { type z } from 'zod'
import { type CreateUserValidationSchema } from './validation'

export interface CreateUserInput
  extends z.infer<typeof CreateUserValidationSchema> {}

export interface User extends CreateUserInput {
  access_token?: string
  is_active: boolean
  created_at: number
  last_seen_at: number
  has_ever_logged_in: boolean
}
