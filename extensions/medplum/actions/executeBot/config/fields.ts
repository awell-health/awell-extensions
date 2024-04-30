import { FieldType, type json, type Field } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  botId: {
    id: 'botId',
    label: 'Bot ID',
    description:
      'You can find the id of your Bot by clicking on the Details tab of the Bot resource in the Medplum app',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'Data in JSON format you would like to pass to the Bot',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  botId: z.string().nonempty({
    message: 'Missing "Bot ID"',
  }),
  body: z
    .optional(z.string())
    .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
      if (isNil(str)) return {}

      try {
        return JSON.parse(str)
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
