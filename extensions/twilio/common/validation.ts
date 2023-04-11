import { z } from 'zod'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { isNil } from 'lodash'

export const PhoneValidationSchema = z.custom<'Phone'>((val) => {
  return !isNil(val) && isPossiblePhoneNumber(val as string)
}, 'Invalid phone number')

export const MessageValidationSchema = z
  .string()
  .min(1, { message: 'Missing or empty message' })
  .max(1600, { message: 'Message can not be longer than 1600 characters' })
