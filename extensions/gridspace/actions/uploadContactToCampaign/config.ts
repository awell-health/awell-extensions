import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

export const fields = {
  campaignId: {
    id: 'campaignId',
    label: 'Campaign ID',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of the Gridspace autodialer campaign.',
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
    description:
      'Any additional data to be passed to the campaign. Should be a JSON object.',
  },
} satisfies Fields

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'json',
  },
  num_uploaded_contacts: {
    key: 'num_uploaded_contacts',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  campaignId: z.string(),
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
