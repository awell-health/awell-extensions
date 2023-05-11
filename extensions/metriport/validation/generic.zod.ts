import { z } from 'zod'

/**
 * stringId is a REQUIRED field, so please use a z.coerce...optional() for non-
 * required numbers
 */
export const stringId = z.coerce.string({
  invalid_type_error: 'Requires a valid ID',
})
