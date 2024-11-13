import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

export const fields = {
  flowId: {
    id: 'flowId',
    label: 'Flow ID',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of the flow to use for the call.',
  },
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone Number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description: 'The phone number to call.',
  },
  data: {
    id: 'data',
    label: 'Data',
    type: FieldType.JSON,
    required: true,
    description: 'Any additional data to be passed to the call.',
  },
} satisfies Fields

export const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  flowId: z.string(),
  phoneNumber: z.string(),
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
})
export type ActionFields = z.infer<typeof FieldsSchema>
