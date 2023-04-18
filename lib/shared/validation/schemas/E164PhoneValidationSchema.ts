import { z } from 'zod'
import {
  parsePhoneNumberWithError,
  type PhoneNumber,
  type ParseError,
} from 'libphonenumber-js'

export const E164PhoneValidationSchema = z
  .string()
  .transform((value) => {
    try {
      const phone = parsePhoneNumberWithError(value)
      return phone
    } catch (error) {
      return error as ParseError
    }
  })
  .superRefine((value, ctx) => {
    if ('message' in value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Phone number is invalid (${value.message})`,
      })
    }
  })
  .transform((value) => {
    return (value as PhoneNumber).number
  })
