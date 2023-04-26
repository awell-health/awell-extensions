import * as z from 'zod'

export const physicianSchema = z
  .object({
    first_name: z.string().nonempty().optional(),
    last_name: z.string().nonempty().optional(),
    email: z.string().email().optional(),
    npi: z.string().email().nonempty().optional(),
    license: z.string().email().nonempty().optional(),
    license_state: z.string().email().nonempty().optional(),
    credentials: z.string().email().nonempty().optional(),
  })
  .strict()
