import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { isEmpty } from 'lodash'

export const fields = {
  stakeholderId: {
    id: 'stakeholderId',
    label: 'Stakeholder',
    description:
      'The stakeholder to create the session for. Leave empty to default to the patient.',
    type: FieldType.STRING,
    required: false,
  },
  exp: {
    id: 'exp',
    label: 'Expiration (epoch seconds)',
    description:
      'When the session should expire, as a Unix timestamp in seconds. If left empty, we default to 30 days.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  stakeholderId: z
    .string()
    .optional()
    .transform((val) => (isEmpty(val) ? undefined : val)),
  exp: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (val === undefined || isEmpty(val)) return undefined
      const parsed = Number(val)
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        ctx.addIssue({ code: 'custom', message: 'exp must be an integer' })
        return z.NEVER
      }
      return parsed
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const PathwayContextValidationSchema = z.object({
  org_id: z.string().min(1),
  tenant_id: z.string().min(1),
})
