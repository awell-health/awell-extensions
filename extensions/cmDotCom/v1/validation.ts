import { z } from 'zod'

export const FromNameValidationSchema = z
  .union([
    // 11 alphanumerical characters
    z.string().nonempty({ message: 'Missing "From/sender name"' }).max(11),
    // 16 digits
    z
      .string()
      .nonempty({ message: 'Missing "From/sender name"' })
      .max(16)
      .regex(/^\d+$/, {
        message:
          '"From/sender name" can contain either up to 11 alphanumerical characters or up to 16 digits',
      }),
  ])
  .optional()
