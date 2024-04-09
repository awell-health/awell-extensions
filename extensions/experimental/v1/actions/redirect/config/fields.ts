import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  redirectUrl: {
    id: 'redirectUrl',
    label: 'Redirect URL',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  redirectMessage: {
    id: 'redirectMessage',
    label: 'Message',
    description:
      'A message that is briefly shown to the user when doing the redirect, leave blank to show nothing',
    type: FieldType.HTML,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  redirectUrl: z.string().min(1),
  redirectMessage: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
