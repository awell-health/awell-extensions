import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

export const dropdownOptionsBoolean = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

export const dropdownOptionsBooleanSchema = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true')

export const JsonObjectSchema = z
  .string()
  .optional()
  .transform((str, ctx): Record<string, unknown> => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)
      return parsedJson
    } catch (e) {
      ctx.addIssue({
        code: 'custom',
        message: 'Not a valid JSON object',
      })
      return z.NEVER
    }
  })

export const JsonArraySchema = z
  .string()
  .optional()
  .transform((str, ctx): Array<Record<string, string>> => {
    if (isNil(str) || isEmpty(str)) return []

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return []
      }

      if (!Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'pronunciation_guide should be an array',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid pronunciation_guide data',
      })
      return z.NEVER
    }
  })
