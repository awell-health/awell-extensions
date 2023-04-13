import { z } from 'zod'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { isEmpty, isNil } from 'lodash'

export const RequiredPhoneValidationSchema = z.custom<string>((val) => {
  if (isEmpty(val) || isNil(val)) return false

  if (typeof val !== 'string') return false

  return isPossiblePhoneNumber(val)
}, 'Invalid (required) phone number')
