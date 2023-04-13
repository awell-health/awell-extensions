import { z } from 'zod'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { isEmpty, isNil } from 'lodash'

export const OptionalPhoneValidationSchema = z.custom<string | undefined>(
  (val) => {
    if (isEmpty(val) || isNil(val)) return true

    if (typeof val !== 'string') return false

    return isPossiblePhoneNumber(val)
  },
  'Invalid (optional) phone number'
)
