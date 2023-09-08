import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'
import { type Metadata } from './types'

export const StringTransformToJson = z
  .string()
  .transform((str, ctx): Metadata => {
    if (isNil(str) || isEmpty(str)) return {}
    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })

export const JsonSchema = StringTransformToJson.transform(
  (jsonObject, ctx): Metadata => {
    if (isNil(jsonObject) || isEmpty(jsonObject)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The object should not be empty',
      })
      return z.NEVER
    }
    return jsonObject
  }
)
