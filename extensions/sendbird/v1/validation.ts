import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'
import { type Metadata } from './types'

export const MetadataValidationSchema = z
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
          message: 'metadata should be an object',
        })
        return z.NEVER
      }

      const values = Object.values(parsedJson)

      if (values.length > 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'metadata should have maximum of five key-value items',
        })
        return z.NEVER
      }

      if (values.some((val) => typeof val !== 'string')) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each metadata key must be a string',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })
