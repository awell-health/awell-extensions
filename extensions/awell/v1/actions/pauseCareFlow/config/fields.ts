import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z, type ZodType } from 'zod'

export const fields = {
  careFlowIds: {
    id: 'careFlowIds',
    label: 'Care flow ID(s)',
    description:
      'The care flow ID(s) to pause. You can pause multiple care flows at once by separating the IDs with a comma. If not provided, the current care flow will be paused.',
    type: FieldType.STRING,
    required: false,
  },
  reason: {
    id: 'reason',
    label: 'Reason',
    description: 'The reason why you want to pause the care flow.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowIds: z
    .string()
    .optional()
    .transform((str) => {
      // Remove all whitespace from the string
      const cleanedStr = str?.replace(/\s/g, '')
      if (isNil(cleanedStr) || isEmpty(cleanedStr)) {
        return []
      }
      return cleanedStr.split(',')
    }),
  reason: z
    .string()
    .optional()
    .default('Default message: Paused by extension.'),
} satisfies Record<keyof typeof fields, ZodType>)
