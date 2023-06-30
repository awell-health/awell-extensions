import { isEmpty } from 'lodash'
import { z } from 'zod'

export const FromNameValidationSchema = z
  .union([
    // 11 alphanumerical characters
    z.string().max(11),
    // 16 digits
    z.string().max(16).regex(/^\d+$/, {
      message:
        '"From/sender name" can contain either up to 11 alphanumerical characters or up to 16 digits',
    }),
  ])
  // if value is empty - treat it as undefined
  .transform((value) => (isEmpty(value) ? undefined : value))
  .optional()
