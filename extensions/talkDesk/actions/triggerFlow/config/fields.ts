import { FieldType, type Field } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  flowId: {
    id: 'flowId',
    label: 'Flow ID',
    description: 'The ID of the flow you would like to trigger',
    type: FieldType.STRING,
    required: true,
  },
  autoComplete: {
    id: 'autoComplete',
    label: 'Autocomplete',
    description:
      'If true, the activity will not wait for the flow to complete (default: false)',
    type: FieldType.BOOLEAN,
    required: false,
  },
  data: {
    id: 'data',
    label: 'Data',
    description:
      'Data to be ingested when triggering the flow, including the `awell_activity_id` so the flow can perform the appropriate completeExtensionActivity callback.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  flowId: z.string().nonempty(),
  autoComplete: z.boolean().optional().default(false),
  data: z.string().transform((str, ctx): Record<string, string> => {
    if (isNil(str) || isEmpty(str)) {
      return {}
    }

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Data should be an object',
        })
        return z.NEVER
      }

      for (const key in parsedJson) {
        if (typeof parsedJson[key] !== 'string') {
          ctx.addIssue({
            code: 'custom',
            message: `Value for key "${key}" must be a string`,
          })
          return z.NEVER
        }
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
