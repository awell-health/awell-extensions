import z from 'zod'
import { isEmpty } from 'lodash'

/**
 * Optional field holding one or more IDs separated by commas, e.g. "abc, def".
 * Parses to a list of trimmed IDs, or undefined when empty. Tolerates null,
 * which Studio may send for an empty optional field.
 */
export const IdListSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value : ''),
  z.string().transform((val) => {
    const ids = val
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')
    return isEmpty(ids) ? undefined : ids
  }),
)
