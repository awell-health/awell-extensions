import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  careFlowIds: {
    id: 'careFlowIds',
    label: 'Care flow ID(s)',
    description: 'The care flow ID(s) to stop. You can stop multiple care flows at once by separating the IDs with a comma. If not provided, the current care flow will be stopped.',
    type: FieldType.STRING,
    required: false,
  },
  reason: {
    id: 'reason',
    label: 'Reason',
    description: 'The reason why you want to stop the care flow.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowIds: z.string().optional().transform((str, ctx) => {
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
    .default('Default message: Stopped by extension.'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
