import { FieldType, type Field } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  pageUrl: {
    id: 'pageUrl',
    label: 'Page URL',
    description: 'The URL of the page to scrape',
    type: FieldType.STRING,
    required: true,
  },
  prompt: {
    id: 'prompt',
    label: 'Prompt',
    description: 'The prompt used to query the page',
    type: FieldType.TEXT,
    required: true,
  },
  jsonSchema: {
    id: 'jsonSchema',
    label: 'JSON Schema',
    description:
      'Optional JSON schema to guide the AI’s response and force it to return JSON. This can be useful if you want a structured response that is more suitable for automated processing.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  pageUrl: z.string().min(1).url(),
  prompt: z.string().min(1),
  jsonSchema: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: 'Not a valid JSON object',
        })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
