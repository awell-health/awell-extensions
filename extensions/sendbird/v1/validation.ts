import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'
import { type Metadata } from './types'

export const JsonStringValidationSchema = z
  .string()
  .transform((str, ctx): Metadata => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value should represent an object',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })

export const MetadataValidationSchema = JsonStringValidationSchema.transform(
  (jsonString, ctx): Metadata => {
    if (isNil(jsonString) || isEmpty(jsonString)) return {}

    try {
      const values = Object.values(jsonString)

      if (values.length > 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'JSON should have maximum of five key-value items',
        })
        return z.NEVER
      }

      if (values.some((val) => typeof val !== 'string')) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each JSON key must be a string',
        })
        return z.NEVER
      }

      if (values.some((val) => val.length > 190)) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each JSON key must not exceed 190 characters',
        })
        return z.NEVER
      }

      const keys = Object.keys(jsonString)

      if (keys.some((key) => key.length > 128)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each key of the JSON must not exceed 128 characters',
        })
        return z.NEVER
      }

      return jsonString
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }
)
