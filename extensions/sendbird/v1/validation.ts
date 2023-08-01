import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

interface CustomFields {
  [key: string]: string | number | boolean | CustomFields
}

export const CreateUserValidationSchema = z.object({
  user_id: z.string().max(80).nonempty(),
  nickname: z.string().max(80).nonempty(),
  profile_url: z.union([z.literal(''), z.string().url()]),
  issue_access_token: z.boolean().optional(),
  metadata: z.optional(z.string()).transform((str, ctx): CustomFields => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'customFields should be an object',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }),
})
