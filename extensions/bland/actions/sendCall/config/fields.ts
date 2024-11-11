import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone number',
    description: '',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  task: {
    id: 'task',
    label: 'Task',
    description:
      'Provide instructions, relevant information, and examples of the ideal conversation flow.',
    type: FieldType.TEXT,
    required: true,
  },
  requestData: {
    id: 'requestData',
    label: 'Request data',
    description:
      'Any JSON you put in here will be visible to the AI agent during the call - and can also be referenced with Prompt Variables.',
    type: FieldType.JSON,
    required: false,
  },
  analysisSchema: {
    id: 'analysisSchema',
    label: 'Analysis schema',
    description:
      'Define a JSON schema for how you want to get information about the call - information like email addresses, names, appointment times or any other type of custom data.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: z.string().min(1),
  task: z.string().min(1),
  requestData: z
    .optional(z.string())
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
  analysisSchema: z
    .optional(z.string())
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
