import { z } from 'zod'
import {
  parsePhoneNumberWithError,
  type PhoneNumber,
  type ParseError,
} from 'libphonenumber-js'
import { makeStringOptional } from '../generic'

export const E164PhoneValidationSchema = z
  .string()
  .transform((value) => {
    try {
      return parsePhoneNumberWithError(value)
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

export const E164PhoneValidationOptionalSchema = makeStringOptional(
  E164PhoneValidationSchema
)
