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
