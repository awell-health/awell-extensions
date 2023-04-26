import { z } from 'zod'
import { passwordSchema } from '../../../lib/shared/settings/oauth.zod'

export const settingsSchema = passwordSchema.extend({
  base_url: z
    .string({ errorMap: () => ({ message: 'Missing base_url' }) })
    .min(1),
})
