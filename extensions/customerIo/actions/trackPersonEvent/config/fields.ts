import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

const IdentifierOptionsSchema = z.enum(['id', 'email', 'cio_id'])

export const fields = {
  personIdentifierType: {
    id: 'personIdentifierType',
    label: 'Person identifier type',
    description:
      'The identifier type used to identify the person. Defaults to email.',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(IdentifierOptionsSchema.options).map(
        (identifier) => ({
          label: identifier,
          value: identifier,
        }),
      ),
    },
  },
  identifierValue: {
    id: 'identifierValue',
    label: 'Identifier value',
    description: 'The value of the identifier used to identify the person.',
    type: FieldType.STRING,
    required: true,
  },
  eventName: {
    id: 'eventName',
    label: 'Event name',
    description:
      "The name of the event. This is how you'll find your event in Customer.io or select it when using events as campaign triggers.",
    type: FieldType.STRING,
    required: true,
  },
  attributes: {
    id: 'attributes',
    label: 'Attributes',
    description:
      'Additional information that you might want to reference in a message using liquid or use to set attributes on the identified person.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  personIdentifierType: IdentifierOptionsSchema.default('email'),
  identifierValue: z.string().min(1),
  eventName: z.string().min(1),
  attributes: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, string> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Attributes should be an object',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
