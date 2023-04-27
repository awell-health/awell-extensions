import { z } from 'zod'

/**
 * NumericIdSchema is a REQUIRED field, so please use a z.coerce...optional() for non-
 * required numbers
 */
export const NumericIdSchema = z.coerce
  .number({
    invalid_type_error: 'Requires a valid ID (number)',
  })
  .positive({
    message: 'Requires a valid ID (number)',
  })
