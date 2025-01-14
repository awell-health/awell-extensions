import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  is_active: z.boolean(),
  practice: z.number(),
  user_type: z.string(),
  is_practice_admin: z.boolean(),
  has_chart_access: z.boolean(),
  physician_qualifications: z
    .object({
      credentials: z.string(),
      npi: z.string(),
      license_state: z.string(),
      license: z.string(),
      dea: z.string().nullable(),
    })
    .nullable()
    .optional(),
})

export interface GetAllUsersResponseType {
  count: number
  next: unknown
  previous: unknown
  results: Array<z.infer<typeof UserSchema>>
}
