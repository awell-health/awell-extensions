import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

export const StringTransformToJson = z
  .string()
  .transform((str, ctx): Record<string, any> => {
    if (isNil(str) || isEmpty(str)) return {}
    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })

export const JsonSchema = StringTransformToJson.transform(
  (jsonObject, ctx): Record<string, any> => {
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

export const JsonArraySchema = StringTransformToJson.transform(
  (jsonObject, ctx): Array<Record<string, any>> => {
    if (!Array.isArray(jsonObject)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
    return jsonObject
  }
)
