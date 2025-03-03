import { isEmpty, isNil } from "lodash"
import { z } from "zod"

export const validateJsonField = <T>(schema: z.ZodType<T>, errorMessage: string) => {
    return (str: string | undefined, ctx: z.RefinementCtx): T | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined
  
      try {
        const parsedJson = JSON.parse(str)
  
        if (isEmpty(parsedJson)) {
          return undefined
        }
  
        const result = schema.safeParse(parsedJson)
  
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            message: errorMessage,
          })
          return z.NEVER
        }
  
        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }
  }