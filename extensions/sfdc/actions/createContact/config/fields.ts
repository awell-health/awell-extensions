import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { attributeSetSchema } from '../../../api/schema'

export const fields = {
  contactKey: {
    id: 'contactKey',
    label: 'Contact key',
    description: 'Primary address for the contact',
    type: FieldType.STRING,
    required: true,
  },
  attributeSets: {
    id: 'attributeSets',
    label: 'Attribute sets	',
    description: 'Array of information used to create a new contact',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  contactKey: z.string().min(1),
  attributeSets: z
    .string()
    .transform((str) => {
      // Parse the string as JSON
      try {
        return JSON.parse(str)
      } catch (e) {
        throw new Error('Invalid JSON string')
      }
    })
    .refine((data): data is z.infer<typeof attributeSetSchema>[] => {
      // Validate the deserialized data against the schema
      try {
        // Parse each item in the array to ensure it matches the schema
        attributeSetSchema.array().parse(data)
        return true
      } catch (e) {
        return false
      }
    }, 'Invalid data structure'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
