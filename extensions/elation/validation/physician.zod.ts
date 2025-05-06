import { optionalEmailSchema } from 'src/utils'
import * as z from 'zod'

export const physicianSchema = z
  .object({
    first_name: z.string().nonempty().optional(),
    last_name: z.string().nonempty().optional(),
    email: optionalEmailSchema,
    npi: z.string().email().nonempty().optional(),
    license: z.string().email().nonempty().optional(),
    license_state: z.string().email().nonempty().optional(),
    credentials: z.string().email().nonempty().optional(),
  })
  .strict()
